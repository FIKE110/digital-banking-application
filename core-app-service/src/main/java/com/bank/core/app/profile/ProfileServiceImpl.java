package com.bank.core.app.profile;

import com.bank.common.dto.profile.ChangeEmailRequest;
import com.bank.common.dto.profile.ChangePasswordRequest;
import com.bank.common.dto.profile.ProfileResponse;
import com.bank.common.dto.profile.UpdateProfileRequest;
import com.bank.common.enums.Gender;
import com.bank.core.data.embed.CustomerName;
import com.bank.core.data.embed.Location;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import com.bank.core.data.user.profile.UserProfile;
import com.bank.core.data.user.profile.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ProfileResponse getProfile() {
        User user = getCurrentUser();
        UserProfile profile = userProfileRepository.findByUserId(user.getId())
                .orElse(null);

        return buildProfileResponse(user, profile);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

        UserProfile profile = userProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> UserProfile.builder()
                        .userId(user.getId())
                        .build());

        CustomerName name = profile.getName() != null ? profile.getName() : new CustomerName();
        if (request.getFirstName() != null) name.setFirstName(request.getFirstName());
        if (request.getLastName() != null) name.setLastName(request.getLastName());
        if (request.getOtherNames() != null) name.setOtherNames(request.getOtherNames());
        if (request.getMiddleName() != null) name.setMiddleName(request.getMiddleName());
        profile.setName(name);

        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) {
            try {
                profile.setGender(Gender.valueOf(request.getGender().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid gender: " + request.getGender());
            }
        }
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber());

        Location location = profile.getLocation() != null ? profile.getLocation() : new Location();
        if (request.getAddress() != null) location.setAddress(request.getAddress());
        if (request.getCity() != null) location.setCity(request.getCity());
        if (request.getCountry() != null) location.setCountry(request.getCountry());
        if (request.getState() != null) location.setState(request.getState());
        if (request.getZip() != null) location.setZip(request.getZip());
        profile.setLocation(location);

        UserProfile savedProfile = userProfileRepository.save(profile);

        return buildProfileResponse(user, savedProfile);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void changeEmail(ChangeEmailRequest request) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (userRepository.findByUsernameOrEmailOrUid(request.getNewEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        user.setEmail(request.getNewEmail());
        userRepository.save(user);
    }

    private ProfileResponse buildProfileResponse(User user, UserProfile profile) {
        ProfileResponse.ProfileResponseBuilder builder = ProfileResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .uid(user.getUid())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt());

        if (profile != null) {
            if (profile.getName() != null) {
                builder.firstName(profile.getName().getFirstName())
                        .lastName(profile.getName().getLastName())
                        .otherNames(profile.getName().getOtherNames())
                        .middleName(profile.getName().getMiddleName());
            }
            if (profile.getDateOfBirth() != null) builder.dateOfBirth(profile.getDateOfBirth());
            if (profile.getGender() != null) builder.gender(profile.getGender().name());
            if (profile.getPhoneNumber() != null) builder.phoneNumber(profile.getPhoneNumber());
            if (profile.getLocation() != null) {
                builder.address(profile.getLocation().getAddress())
                        .city(profile.getLocation().getCity())
                        .country(profile.getLocation().getCountry())
                        .state(profile.getLocation().getState())
                        .zip(profile.getLocation().getZip());
            }
        }

        return builder.build();
    }

    @Override
    @Transactional
    public String uploadAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file is required");
        }
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("Avatar image must be smaller than 2MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Avatar must be an image file");
        }

        User user = getCurrentUser();
        String extension = switch (contentType) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            default -> "jpg";
        };
        String fileName = user.getId() + "-" + System.currentTimeMillis() + "." + extension;

        try {
            java.nio.file.Path dir = java.nio.file.Path.of("uploads", "avatars").toAbsolutePath();
            java.nio.file.Files.createDirectories(dir);
            java.nio.file.Path target = dir.resolve(fileName);
            file.transferTo(target.toFile());

            String url = "/uploads/avatars/" + fileName;
            user.setAvatarUrl(url);
            userRepository.save(user);
            return url;
        } catch (java.io.IOException e) {
            throw new IllegalArgumentException("Failed to store avatar image", e);
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }

        String username = authentication.getName();
        return userRepository.findByUsernameOrEmailOrUid(username)
                .orElseThrow(() -> new IllegalStateException("User not found: " + username));
    }
}