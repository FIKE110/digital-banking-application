package com.bank.core.app.auth.controller;

import com.bank.common.constant.MessageConstant;
import com.bank.common.dto.auth.LoginRequestDto;
import com.bank.common.dto.auth.LoginResponseDto;
import com.bank.common.dto.auth.SignupRequestDto;
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

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(@RequestBody LoginRequestDto dto) {
        LoginResponseDto loginResponseDto=authService.loginUser(dto);
        return ApiResponseUtil.buildSuccess(
                loginResponseDto
        );
    }

    @PostMapping("/refresh")
    public String refresh() {
        return "TOKEN_REFRESHED";
    }

    @PostMapping("/logout")
    public String logout() {
        return "LOGGED_OUT";
    }

    @PostMapping("/forgot-password")
    public String forgotPassword() {
        return "OTP_SENT";
    }

    @PostMapping("/reset-password")
    public String resetPassword() {
        return "PASSWORD_RESET";
    }

    @GetMapping("/me")
    public String me() {
        return "USER_FETCHED";
    }
}
