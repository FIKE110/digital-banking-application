package com.bank.core.app.admin;

import com.bank.common.dto.admin.KycResponse;
import com.bank.common.enums.AdminAuditEventType;
import com.bank.common.enums.KycTier;
import com.bank.common.enums.VerificationStatus;
import com.bank.core.app.notification.NotificationService;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import com.bank.core.data.user.kyc.KycRepository;
import com.bank.core.data.user.kyc.UserKyc;
import com.bank.core.data.user.profile.UserProfile;
import com.bank.core.data.user.profile.UserProfileRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminKycService {

    private final KycRepository kycRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final AdminAuditService adminAuditService;
    private final NotificationService notificationService;
    private final SecurityUtil securityUtil;

    @Transactional(readOnly = true)
    public Page<KycResponse> listKyc(String status, Pageable pageable) {
        List<UserKyc> all = kycRepository.findAll();

        List<UserKyc> filtered = all.stream()
                .filter(k -> status == null || status.isBlank()
                        || status.equalsIgnoreCase(k.getBvnVerificationStatus() == null ? "UNVERIFIED" : k.getBvnVerificationStatus().name()))
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<KycResponse> content = start >= filtered.size()
                ? List.of()
                : filtered.subList(start, end).stream().map(this::mapToResponse).toList();

        return new org.springframework.data.domain.PageImpl<>(content, pageable, filtered.size());
    }

    @Transactional
    public KycResponse approveKyc(Long id, HttpServletRequest request) {
        UserKyc kyc = kycRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("KYC not found: " + id));
        String previous = kyc.getBvnVerificationStatus() != null ? kyc.getBvnVerificationStatus().name() : "UNVERIFIED";
        kyc.setBvnVerificationStatus(VerificationStatus.VERIFIED);
        kyc.setNinVerificationStatus(VerificationStatus.VERIFIED);
        KycTier previousTier = kyc.getTier() != null ? kyc.getTier() : KycTier.TIER_1;
        kyc.setTier(nextTier(previousTier));
        UserKyc saved = kycRepository.save(kyc);

        adminAuditService.audit(AdminAuditEventType.CUSTOMER_PROFILE_MODIFIED, "KYC", String.valueOf(id),
                usernameOf(saved), "KYC approved (was " + previous + ")",
                previous, "VERIFIED", request);

        notifyCustomer(saved, "KYC approved",
                "Your identity was verified and your account tier is now " + saved.getTier().name()
                        + ". Enjoy higher limits.");
        return mapToResponse(saved);
    }

    @Transactional
    public KycResponse rejectKyc(Long id, String reason, HttpServletRequest request) {
        UserKyc kyc = kycRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("KYC not found: " + id));
        String previous = kyc.getBvnVerificationStatus() != null ? kyc.getBvnVerificationStatus().name() : "UNVERIFIED";
        kyc.setBvnVerificationStatus(VerificationStatus.UNVERIFIED);
        kyc.setNinVerificationStatus(VerificationStatus.UNVERIFIED);
        UserKyc saved = kycRepository.save(kyc);

        adminAuditService.audit(AdminAuditEventType.CUSTOMER_PROFILE_MODIFIED, "KYC", String.valueOf(id),
                usernameOf(saved), "KYC rejected" + (reason != null ? ": " + reason : ""),
                previous, "UNVERIFIED", request);

        notifyCustomer(saved, "KYC rejected",
                "Your identity verification was rejected" + (reason != null ? ": " + reason : "")
                        + ". Please resubmit your details.");
        return mapToResponse(saved);
    }

    private KycTier nextTier(KycTier current) {
        return switch (current) {
            case TIER_1 -> KycTier.TIER_2;
            case TIER_2 -> KycTier.TIER_3;
            case TIER_3 -> KycTier.TIER_3;
        };
    }

    private void notifyCustomer(UserKyc kyc, String title, String body) {
        if (kyc.getUser() != null && kyc.getUser().getUserId() != null) {
            notificationService.notify(kyc.getUser().getUserId(), "SECURITY", title, body);
        }
    }

    private String usernameOf(UserKyc kyc) {
        if (kyc.getUser() != null && kyc.getUser().getUserId() != null) {
            return userRepository.findById(kyc.getUser().getUserId())
                    .map(User::getUsername).orElse("User #" + kyc.getUser().getUserId());
        }
        return "KYC #" + kyc.getId();
    }

    private KycResponse mapToResponse(UserKyc kyc) {
        Long userId = kyc.getUser() != null ? kyc.getUser().getUserId() : null;
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        return KycResponse.builder()
                .id(kyc.getId())
                .userId(userId)
                .username(user != null ? user.getUsername() : null)
                .email(user != null ? user.getEmail() : null)
                .bvn(maskNumber(kyc.getBvn()))
                .bvnStatus(kyc.getBvnVerificationStatus() != null ? kyc.getBvnVerificationStatus().name() : "UNVERIFIED")
                .nin(maskNumber(kyc.getNin()))
                .ninStatus(kyc.getNinVerificationStatus() != null ? kyc.getNinVerificationStatus().name() : "UNVERIFIED")
                .tier(kyc.getTier() != null ? kyc.getTier().name() : "TIER_1")
                .createdAt(kyc.getCreatedAt())
                .updatedAt(kyc.getUpdatedAt())
                .build();
    }

    private String maskNumber(String value) {
        if (value == null || value.length() <= 4) return value;
        return "****" + value.substring(value.length() - 4);
    }
}