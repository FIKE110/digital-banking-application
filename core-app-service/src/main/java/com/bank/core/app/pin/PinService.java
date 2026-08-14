package com.bank.core.app.pin;

import com.bank.common.constant.ErrorConstant;
import com.bank.common.dto.pin.PinStatusResponse;
import com.bank.common.dto.pin.SetPinRequest;
import com.bank.common.dto.pin.VerifyPinRequest;
import com.bank.common.enums.OtpType;
import com.bank.common.exception.CustomException;
import com.bank.core.app.outbox.OutboxService;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import com.bank.core.data.user.otp.UserOtp;
import com.bank.core.data.user.otp.UserOtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class PinService {

    private static final long PIN_ATTEMPTS_LIMIT = 5;

    private final UserRepository userRepository;
    private final UserOtpRepository userOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;
    private final OutboxService outboxService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public PinStatusResponse getStatus() {
        User user = securityUtil.currentUser();
        return PinStatusResponse.builder()
                .pinSet(user.getTransactionPin() != null)
                .pinSetAt(user.getPinSetAt())
                .build();
    }

    @Transactional
    public void setPin(SetPinRequest request) {
        User user = securityUtil.currentUser();

        if (user.getTransactionPin() != null) {
            if (request.getCurrentPin() == null || request.getCurrentPin().isBlank()) {
                throw new IllegalStateException("Current PIN is required to change your PIN");
            }
            if (!passwordEncoder.matches(request.getCurrentPin(), user.getTransactionPin())) {
                throw new IllegalStateException("Current PIN is incorrect");
            }
        }

        user.setTransactionPin(passwordEncoder.encode(request.getPin()));
        user.setPinSetAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("Transaction PIN {} for user {}", user.getTransactionPin() != null ? "updated" : "set", user.getUsername());
    }

    @Transactional
    public void verifyPin(VerifyPinRequest request) {
        User user = securityUtil.currentUser();

        if (user.getTransactionPin() == null) {
            throw new IllegalStateException("Transaction PIN not set. Please create one in Settings → Security PIN.");
        }

        if (user.getPinAttempts() != null && user.getPinAttempts() >= PIN_ATTEMPTS_LIMIT) {
            throw new IllegalStateException("Too many PIN attempts. Please reset your PIN or contact support.");
        }

        if (!passwordEncoder.matches(request.getPin(), user.getTransactionPin())) {
            user.setPinAttempts((user.getPinAttempts() == null ? 0 : user.getPinAttempts()) + 1);
            userRepository.save(user);
            log.warn("Failed PIN verification for user {}", user.getUsername());
            throw new IllegalStateException("Incorrect transaction PIN");
        }

        user.setPinAttempts(0);
        userRepository.save(user);
        log.info("Transaction PIN verified for user {}", user.getUsername());
    }

    public void forgotPin(String email) {
        User user = userRepository.findByUsernameOrEmailOrUid(email)
                .orElseThrow(() -> new CustomException(ErrorConstant.NOT_FOUND_MSG, "User not found with email: " + email));

        userOtpRepository.findTopByUserUidAndOtpTypeAndVerifiedAtIsNullOrderByCreatedAtDesc(
                user.getUid(), OtpType.FORGOT_PIN).ifPresent(otp -> {
            otp.setVerifiedAt(LocalDateTime.now());
            userOtpRepository.save(otp);
        });

        String code = String.format("%06d", new Random().nextInt(999999));
        UserOtp userOtp = UserOtp.builder()
                .userUid(user.getUid())
                .otpCode(code)
                .otpType(OtpType.FORGOT_PIN)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .attemptCount(0)
                .build();
        userOtpRepository.save(userOtp);

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", user.getEmail());
            payload.put("otp", code);
            payload.put("name", user.getUsername());
            payload.put("expiresAt", userOtp.getExpiresAt().toString());
            outboxService.saveEvent("USER", user.getUid(), "OTP_SENT",
                    objectMapper.writeValueAsString(payload),
                    userOtp.getExpiresAt());
        } catch (Exception e) {
            throw new CustomException(ErrorConstant.INTERNAL_SERVER_ERROR, "Failed to serialize outbox payload");
        }
    }

    @Transactional
    public void resetPin(String email, String otp, String newPin) {
        User user = userRepository.findByUsernameOrEmailOrUid(email)
                .orElseThrow(() -> new CustomException(ErrorConstant.NOT_FOUND_MSG, "User not found with email: " + email));

        UserOtp pinOtp = userOtpRepository.findTopByUserUidAndOtpTypeAndVerifiedAtIsNullOrderByCreatedAtDesc(
                user.getUid(), OtpType.FORGOT_PIN)
                .orElseThrow(() -> new IllegalStateException("No pending PIN reset request found"));

        if (pinOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("OTP has expired");
        }
        if (pinOtp.getAttemptCount() >= 3) {
            pinOtp.setVerifiedAt(LocalDateTime.now());
            userOtpRepository.save(pinOtp);
            throw new IllegalStateException("Maximum OTP attempts exceeded");
        }
        if (!pinOtp.getOtpCode().equals(otp)) {
            pinOtp.setAttemptCount(pinOtp.getAttemptCount() + 1);
            userOtpRepository.save(pinOtp);
            throw new IllegalStateException("Invalid OTP");
        }

        pinOtp.setVerifiedAt(LocalDateTime.now());
        userOtpRepository.save(pinOtp);

        user.setTransactionPin(passwordEncoder.encode(newPin));
        user.setPinSetAt(LocalDateTime.now());
        user.setPinAttempts(0);
        userRepository.save(user);
        log.info("Transaction PIN reset for user {}", user.getUsername());
    }
}