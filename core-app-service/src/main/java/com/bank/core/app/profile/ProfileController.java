package com.bank.core.app.profile;

import com.bank.common.dto.profile.ChangeEmailRequest;
import com.bank.common.dto.profile.ChangePasswordRequest;
import com.bank.common.dto.profile.ProfileResponse;
import com.bank.common.dto.profile.UpdateProfileRequest;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static com.bank.common.constant.ApiConstant.API_V1_PATH;
import static com.bank.common.constant.ApiConstant.PROFILE_BASE;

@RestController
@RequestMapping(API_V1_PATH + PROFILE_BASE)
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile() {
        ProfileResponse profile = profileService.getProfile();
        return ApiResponseUtil.buildSuccess("Profile fetched successfully", profile);
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        ProfileResponse updated = profileService.updateProfile(request);
        return ApiResponseUtil.buildSuccess("Profile updated successfully", updated);
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(request);
        return ApiResponseUtil.buildSuccess("Password changed successfully", null);
    }

    @PutMapping("/email")
    public ResponseEntity<ApiResponse<Void>> changeEmail(
            @Valid @RequestBody ChangeEmailRequest request) {
        profileService.changeEmail(request);
        return ApiResponseUtil.buildSuccess("Email changed successfully", null);
    }

    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String url = profileService.uploadAvatar(file);
        return ApiResponseUtil.buildSuccess("Avatar uploaded successfully", url);
    }
}