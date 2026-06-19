package com.bank.core.app.auth;

import org.springframework.web.bind.annotation.*;

import static com.bank.common.constant.ApiConstant.AUTH_BASE;

@RestController
@RequestMapping(AUTH_BASE)
public class AuthController {

    @PostMapping("/register")
    public String register() {
        return "USER_REGISTERED";
    }

    @PostMapping("/login")
    public String login() {
        return "LOGIN_SUCCESSFUL";
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
