package com.bank.core.app.auth.controller;

import com.bank.common.constant.MessageConstant;
import com.bank.common.dto.auth.ForgotPasswordRequestDto;
import com.bank.common.dto.auth.LoginRequestDto;
import com.bank.common.dto.auth.LoginResponseDto;
import com.bank.common.dto.auth.ResendVerificationRequestDto;
import com.bank.common.dto.auth.ResetPasswordRequestDto;
import com.bank.common.dto.auth.SignupRequestDto;
import com.bank.common.dto.auth.UserResponseDto;
import com.bank.common.dto.auth.VerifyEmailRequestDto;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import com.bank.core.app.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.bank.common.constant.ApiConstant.API_V1_PATH;
import static com.bank.common.constant.ApiConstant.AUTH_BASE;

@RestController
@RequestMapping(API_V1_PATH + AUTH_BASE)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Object>> register(@RequestBody SignupRequestDto dto) {
        authService.signupUser(dto);
        return ApiResponseUtil.buildSuccess(HttpStatus.CREATED.value(), MessageConstant.USER_CREATED,null);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Object>> verifyEmail(@RequestBody VerifyEmailRequestDto dto) {
        authService.verifyEmail(dto);
        return ApiResponseUtil.buildSuccess(HttpStatus.OK.value(), MessageConstant.EMAIL_VERIFIED_SUCCESS, null);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Object>> resendVerification(@RequestBody ResendVerificationRequestDto dto) {
        authService.resendEmailVerification(dto);
        return ApiResponseUtil.buildSuccess(HttpStatus.OK.value(), MessageConstant.OTP_SENT, null);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(@RequestBody LoginRequestDto dto) {
        LoginResponseDto loginResponseDto=authService.loginUser(dto);
        return ApiResponseUtil.buildSuccess(
                loginResponseDto
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponseDto>> refresh(@RequestParam("token") String refreshToken) {
        LoginResponseDto dto=authService.refreshToken(refreshToken);
        return ApiResponseUtil.buildSuccess(MessageConstant.TOKEN_REFRESHED,dto);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout(@RequestParam("token") String accessToken) {
        authService.logout(accessToken);
        return ApiResponseUtil.buildSuccess(HttpStatus.OK.value(), MessageConstant.LOGOUT_SUCCESS,null);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Object>> forgotPassword(@RequestBody ForgotPasswordRequestDto dto) {
        authService.forgotPassword(dto);
        return ApiResponseUtil.buildSuccess(HttpStatus.OK.value(), MessageConstant.OTP_SENT,null);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(@RequestBody ResetPasswordRequestDto dto) {
        authService.resetPassword(dto);
        return ApiResponseUtil.buildSuccess(HttpStatus.OK.value(), MessageConstant.PASSWORD_RESET,null);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> me(@RequestParam("token") String accessToken) {
        UserResponseDto dto=authService.getCurrentUser(accessToken);
        return ApiResponseUtil.buildSuccess(dto);
    }
}
