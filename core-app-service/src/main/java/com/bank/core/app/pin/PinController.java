package com.bank.core.app.pin;

import com.bank.common.dto.pin.PinStatusResponse;
import com.bank.common.dto.pin.SetPinRequest;
import com.bank.common.dto.pin.VerifyPinRequest;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + "/pin")
@RequiredArgsConstructor
public class PinController {

    private final PinService pinService;

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<PinStatusResponse>> getStatus() {
        return ApiResponseUtil.buildSuccess("PIN status fetched", pinService.getStatus());
    }

    @PostMapping("/set")
    public ResponseEntity<ApiResponse<Object>> setPin(@Valid @RequestBody SetPinRequest request) {
        pinService.setPin(request);
        return ApiResponseUtil.buildSuccess("Transaction PIN set successfully", null);
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Object>> verifyPin(@Valid @RequestBody VerifyPinRequest request) {
        pinService.verifyPin(request);
        return ApiResponseUtil.buildSuccess("PIN verified", null);
    }

    @PostMapping("/forgot")
    public ResponseEntity<ApiResponse<Object>> forgotPin(@RequestBody Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        pinService.forgotPin(email);
        return ApiResponseUtil.buildSuccess("OTP sent to your email", null);
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<Object>> resetPin(@RequestBody Map<String, String> body) {
        pinService.resetPin(body.get("email"), body.get("otp"), body.get("newPin"));
        return ApiResponseUtil.buildSuccess("Transaction PIN reset successfully", null);
    }
}