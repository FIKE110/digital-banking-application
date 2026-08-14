package com.bank.core.app.kyc;

import com.bank.common.dto.kyc.KycStatusResponse;
import com.bank.common.dto.kyc.KycSubmitRequest;
import com.bank.common.enums.KycTier;
import com.bank.common.enums.VerificationStatus;
import com.bank.core.app.notification.NotificationService;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.user.kyc.KycRepository;
import com.bank.core.data.user.kyc.UserKyc;
import com.bank.core.data.user.profile.UserProfile;
import com.bank.core.data.user.profile.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class KycService {

    private final KycRepository kycRepository;
    private final UserProfileRepository userProfileRepository;
    private final SecurityUtil securityUtil;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public KycStatusResponse getStatus() {
        Long userId = securityUtil.currentUserId();
        return userProfileRepository.findByUserId(userId)
                .flatMap(profile -> kycRepository.findByUserUserId(profile.getUserId()))
                .map(this::mapToResponse)
                .orElseGet(() -> KycStatusResponse.builder()
                        .bvnVerificationStatus(VerificationStatus.UNVERIFIED.name())
                        .ninVerificationStatus(VerificationStatus.UNVERIFIED.name())
                        .tier(KycTier.TIER_1.name())
                        .verified(false)
                        .build());
    }

    @Transactional
    public KycStatusResponse submit(KycSubmitRequest request) {
        Long userId = securityUtil.currentUserId();
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> userProfileRepository.save(
                        UserProfile.builder().userId(userId).build()));
        UserKyc kyc = kycRepository.findByUserUserId(profile.getUserId())
                .orElseGet(() -> {
                    UserKyc created = new UserKyc();
                    created.setUser(profile);
                    return created;
                });

        boolean resubmitting = kyc.getBvn() != null;
        kyc.setBvn(request.getBvn());
        kyc.setNin(request.getNin());
        kyc.setBvnVerificationStatus(VerificationStatus.PENDING);
        kyc.setNinVerificationStatus(VerificationStatus.PENDING);
        UserKyc saved = kycRepository.save(kyc);

        log.info("KYC {} by user {} — BVN {} / NIN {}",
                resubmitting ? "resubmitted" : "submitted",
                userId, maskNumber(request.getBvn()), maskNumber(request.getNin()));

        if (resubmitting) {
            notificationService.notify(userId, "SYSTEM", "KYC resubmitted",
                    "Your identity details were resubmitted and are pending review.");
        } else {
            notificationService.notify(userId, "SYSTEM", "KYC submitted",
                    "Your identity details were submitted and are pending review.");
        }

        return mapToResponse(saved);
    }

    private KycStatusResponse mapToResponse(UserKyc kyc) {
        VerificationStatus bvnStatus = kyc.getBvnVerificationStatus() != null
                ? kyc.getBvnVerificationStatus() : VerificationStatus.UNVERIFIED;
        VerificationStatus ninStatus = kyc.getNinVerificationStatus() != null
                ? kyc.getNinVerificationStatus() : VerificationStatus.UNVERIFIED;
        return KycStatusResponse.builder()
                .id(kyc.getId())
                .bvnVerificationStatus(bvnStatus.name())
                .ninVerificationStatus(ninStatus.name())
                .tier(kyc.getTier() != null ? kyc.getTier().name() : KycTier.TIER_1.name())
                .verified(bvnStatus == VerificationStatus.VERIFIED
                        && ninStatus == VerificationStatus.VERIFIED)
                .bvn(maskNumber(kyc.getBvn()))
                .nin(maskNumber(kyc.getNin()))
                .build();
    }

    private String maskNumber(String value) {
        if (value == null || value.length() <= 4) return value;
        return "****" + value.substring(value.length() - 4);
    }
}