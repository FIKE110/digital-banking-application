package com.bank.core.app.profile;

import org.springframework.web.bind.annotation.*;

import static com.bank.common.constant.ApiConstant.API_V1_PATH;
import static com.bank.common.constant.ApiConstant.PROFILE_BASE;

@RestController
@RequestMapping(API_V1_PATH + PROFILE_BASE)
public class ProfileController {

    @GetMapping
    public String get() {
        return "PROFILE_FETCHED";
    }

    @PutMapping
    public String update() {
        return "PROFILE_UPDATED";
    }

    @PutMapping("/password")
    public String changePassword() {
        return "PASSWORD_CHANGED";
    }

    @PutMapping("/email")
    public String changeEmail() {
        return "EMAIL_CHANGED";
    }

    @PostMapping("/avatar")
    public String uploadAvatar() {
        return "AVATAR_UPLOADED";
    }
}
