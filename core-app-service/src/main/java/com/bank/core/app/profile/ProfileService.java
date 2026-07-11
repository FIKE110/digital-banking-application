package com.bank.core.app.profile;

import com.bank.common.dto.profile.ChangeEmailRequest;
import com.bank.common.dto.profile.ChangePasswordRequest;
import com.bank.common.dto.profile.ProfileResponse;
import com.bank.common.dto.profile.UpdateProfileRequest;

public interface ProfileService {

    ProfileResponse getProfile();

    ProfileResponse updateProfile(UpdateProfileRequest request);

    void changePassword(ChangePasswordRequest request);

    void changeEmail(ChangeEmailRequest request);
}