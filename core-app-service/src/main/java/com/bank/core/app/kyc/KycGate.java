package com.bank.core.app.kyc;

import com.bank.common.enums.KycStatus;
import com.bank.common.exception.KycRequiredException;
import com.bank.core.data.user.kyc.KycRepository;
import com.bank.core.data.user.kyc.UserKyc;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KycGate {

    private final KycRepository kycRepository;

    public void requireApproved(Long userId, String action) {
        UserKyc kyc = kycRepository.findByUserUserId(userId).orElse(null);
        if (kyc == null || kyc.getStatus() != KycStatus.APPROVED) {
            throw new KycRequiredException(
                    "KYC verification is required for " + action
                            + ". Complete identity verification and wait for approval.");
        }
    }
}