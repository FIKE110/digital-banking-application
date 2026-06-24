package com.bank.core.data.user.otp;

import com.bank.common.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserOtpRepository extends JpaRepository<UserOtp, Long> {

    Optional<UserOtp> findTopByUserUidAndOtpTypeAndVerifiedAtIsNullOrderByCreatedAtDesc(
            String userUid, OtpType otpType);
}
