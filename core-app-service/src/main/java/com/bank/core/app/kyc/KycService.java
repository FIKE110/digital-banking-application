package com.bank.core.app.kyc;

import com.bank.common.dto.kyc.KycStatusResponse;
import com.bank.common.dto.kyc.KycSubmitRequest;
import com.bank.common.enums.Gender;
import com.bank.common.enums.KycStatus;
import com.bank.common.enums.KycTier;
import com.bank.common.enums.VerificationStatus;
import com.bank.core.app.notification.NotificationService;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.embed.CustomerName;
import com.bank.core.data.embed.Location;
import com.bank.core.data.user.kyc.KycRepository;
import com.bank.core.data.user.kyc.UserKyc;
import com.bank.core.data.user.profile.UserProfile;
import com.bank.core.data.user.profile.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
                        .status(KycStatus.NOT_STARTED.name())
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
                .orElseGet(() -> UserProfile.builder().userId(userId).build());

        profile.setName(CustomerName.of(request.getFirstName(), request.getLastName()));
        profile.setDateOfBirth(parseDate(request.getDateOfBirth()));
        profile.setGender(parseGender(request.getGender()));
        profile.setPhoneNumber(request.getPhoneNumber());
        Location location = new Location();
        location.setAddress(request.getAddress());
        location.setCity(request.getCity());
        location.setState(request.getState());
        location.setCountry(request.getCountry());
        profile.setLocation(location);
        UserProfile savedProfile = userProfileRepository.save(profile);

        UserKyc kyc = kycRepository.findByUserUserId(savedProfile.getUserId())
                .orElseGet(() -> {
                    UserKyc created = new UserKyc();
                    created.setUser(savedProfile);
                    return created;
                });

        boolean resubmitting = kyc.getBvn() != null;
        kyc.setBvn(request.getBvn());
        kyc.setNin(request.getNin());
        kyc.setBvnVerificationStatus(VerificationStatus.PENDING);
        kyc.setNinVerificationStatus(VerificationStatus.PENDING);
        kyc.setStatus(KycStatus.UNDER_REVIEW);
        kyc.setRejectionReason(null);
        kyc.setSubmittedAt(LocalDateTime.now());
        UserKyc saved = kycRepository.save(kyc);

        log.info("KYC {} by user {} — BVN {} / NIN {} — MOCK identity match passed",
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

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Date of birth is required");
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date of birth, expected yyyy-MM-dd");
        }
    }

    private Gender parseGender(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Gender is required");
        }
        try {
            return Gender.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid gender, expected MALE or FEMALE");
        }
    }

    private KycStatusResponse mapToResponse(UserKyc kyc) {
        VerificationStatus bvnStatus = kyc.getBvnVerificationStatus() != null
                ? kyc.getBvnVerificationStatus() : VerificationStatus.UNVERIFIED;
        VerificationStatus ninStatus = kyc.getNinVerificationStatus() != null
                ? kyc.getNinVerificationStatus() : VerificationStatus.UNVERIFIED;
        UserProfile profile = kyc.getUser();
        KycStatusResponse.KycStatusResponseBuilder builder = KycStatusResponse.builder()
                .id(kyc.getId())
                .status(kyc.getStatus() != null ? kyc.getStatus().name() : KycStatus.NOT_STARTED.name())
                .bvnVerificationStatus(bvnStatus.name())
                .ninVerificationStatus(ninStatus.name())
                .tier(kyc.getTier() != null ? kyc.getTier().name() : KycTier.TIER_1.name())
                .verified(bvnStatus == VerificationStatus.VERIFIED
                        && ninStatus == VerificationStatus.VERIFIED)
                .bvn(maskNumber(kyc.getBvn()))
                .nin(maskNumber(kyc.getNin()))
                .rejectionReason(kyc.getRejectionReason())
                .submittedAt(kyc.getSubmittedAt())
                .approvedAt(kyc.getApprovedAt());

        if (profile != null) {
            if (profile.getName() != null) {
                builder.firstName(profile.getName().getFirstName());
                builder.lastName(profile.getName().getLastName());
            }
            if (profile.getDateOfBirth() != null) {
                builder.dateOfBirth(profile.getDateOfBirth().toString());
            }
            if (profile.getGender() != null) {
                builder.gender(profile.getGender().name());
            }
            builder.phoneNumber(profile.getPhoneNumber());
            if (profile.getLocation() != null) {
                builder.address(profile.getLocation().getAddress());
                builder.city(profile.getLocation().getCity());
                builder.state(profile.getLocation().getState());
                builder.country(profile.getLocation().getCountry());
            }
        }
        return builder.build();
    }

    private String maskNumber(String value) {
        if (value == null || value.length() <= 4) return value;
        return "****" + value.substring(value.length() - 4);
    }
}