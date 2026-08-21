package com.bank.core.app.auth.service;

import com.bank.common.constant.ErrorConstant;
import com.bank.common.dto.auth.ForgotPasswordRequestDto;
import com.bank.common.dto.auth.LoginRequestDto;
import com.bank.common.dto.auth.LoginResponseDto;
import com.bank.common.dto.auth.ResetPasswordRequestDto;
import com.bank.common.dto.auth.SignupRequestDto;
import com.bank.common.dto.auth.Token;
import com.bank.common.dto.auth.UserResponseDto;
import com.bank.common.enums.OtpType;
import com.bank.common.exception.CustomException;
import com.bank.common.exception.DuplicateResourceException;
import com.bank.core.app.user.UserDetailsServiceImpl;
import com.bank.core.data.role.Role;
import com.bank.core.data.role.RoleRepository;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import com.bank.core.data.user.otp.UserOtp;
import com.bank.core.data.user.otp.UserOtpRepository;
import com.bank.core.app.notification.NotificationService;
import com.bank.core.app.outbox.OutboxService;
import com.bank.core.lib.service.JwtService;
import com.github.f4b6a3.ulid.UlidCreator;
import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserDetailsServiceImpl userDetailsServiceImpl;
    private final UserOtpRepository userOtpRepository;
    private final OutboxService outboxService;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;
    private final com.bank.core.data.user.profile.UserProfileRepository userProfileRepository;
    private final com.bank.core.data.user.kyc.KycRepository kycRepository;

    @Transactional
    public LoginResponseDto loginUser(LoginRequestDto loginRequestDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequestDto.getUsername(), loginRequestDto.getPassword())
        );

        if(!authentication.isAuthenticated()) throw new BadCredentialsException("Invalid username or password");

        Token token= new Token();
        token.setAccessToken(jwtService.generateAccessToken(authentication));
        token.setRefreshToken(jwtService.generateRefreshToken(authentication));

        if (authentication.getPrincipal() instanceof User user) {
            notificationService.notify(user.getId(), "SECURITY", "New sign-in detected",
                    "Your account was signed in to from a new device. If this was you, no action is needed.");
        }

        return LoginResponseDto.builder()
                .token(token)
                .build();

    }

    @Transactional
    public void signupUser(SignupRequestDto dto) {

        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new DuplicateResourceException("Username already taken: " + dto.getUsername());
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email already taken: " + dto.getEmail());
        }

        Role role=roleRepository.findByName("ROLE_USER").orElseThrow(()->new CustomException(ErrorConstant.NOT_FOUND_MSG,"Role not found"));

        User user = new User();
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setAuthorities(Collections.emptyList());
        user.setUid(UlidCreator.getUlid().toString());
        user.setLastLogoutDate(null);
        user.setRoles(Set.of(role));
        user.setPermissions(Collections.emptySet());
        userRepository.save(user);

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", user.getEmail());
            payload.put("name", user.getUsername());
            outboxService.saveEvent("USER", user.getUid(), "USER_REGISTERED",
                    objectMapper.writeValueAsString(payload),
                    LocalDateTime.now().plusYears(100));
        } catch (Exception e) {
            throw new CustomException(ErrorConstant.INTERNAL_SERVER_ERROR, "Failed to serialize outbox payload");
        }
    }

    public void logout(String accessToken) {
        if(!jwtService.isAccessTokenValid(accessToken)) throw new BadCredentialsException("Invalid access token");
        Jwt jwt=jwtService.decode(accessToken);
        User user= (User) userDetailsServiceImpl.loadUserByUsername(Objects.requireNonNull(jwt.getSubject()));
        user.setLastLogoutDate(LocalDateTime.now());
        userRepository.save(user);
    }

    public void forgotPassword(ForgotPasswordRequestDto dto) {
        User user=userRepository.findByUsernameOrEmailOrUid(dto.getEmail())
                .orElseThrow(()->new CustomException(ErrorConstant.NOT_FOUND_MSG,"User not found with email: "+dto.getEmail()));

        userOtpRepository.findTopByUserUidAndOtpTypeAndVerifiedAtIsNullOrderByCreatedAtDesc(
                user.getUid(), OtpType.FORGOT_PASSWORD).ifPresent(otp->{
            otp.setVerifiedAt(LocalDateTime.now());
            userOtpRepository.save(otp);
        });

        String code=String.format("%06d", new Random().nextInt(999999));

        UserOtp userOtp=UserOtp.builder()
                .userUid(user.getUid())
                .otpCode(code)
                .otpType(OtpType.FORGOT_PASSWORD)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .attemptCount(0)
                .build();
        userOtpRepository.save(userOtp);

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", user.getEmail());
            payload.put("otpCode", code);
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
    public void resetPassword(ResetPasswordRequestDto dto) {
        User user=userRepository.findByUsernameOrEmailOrUid(dto.getEmail())
                .orElseThrow(()->new CustomException(ErrorConstant.NOT_FOUND_MSG,"User not found with email: "+dto.getEmail()));

        UserOtp otp=userOtpRepository.findTopByUserUidAndOtpTypeAndVerifiedAtIsNullOrderByCreatedAtDesc(
                user.getUid(), OtpType.FORGOT_PASSWORD)
                .orElseThrow(()->new BadCredentialsException("No pending OTP found"));

        if(otp.getExpiresAt().isBefore(LocalDateTime.now())){
            throw new BadCredentialsException("OTP has expired");
        }

        if(otp.getAttemptCount()>=3){
            otp.setVerifiedAt(LocalDateTime.now());
            userOtpRepository.save(otp);
            throw new BadCredentialsException("Maximum OTP attempts exceeded");
        }

        if(!otp.getOtpCode().equals(dto.getOtp())){
            otp.setAttemptCount(otp.getAttemptCount()+1);
            userOtpRepository.save(otp);
            throw new BadCredentialsException("Invalid OTP");
        }

        otp.setVerifiedAt(LocalDateTime.now());
        userOtpRepository.save(otp);

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", user.getEmail());
            payload.put("name", user.getUsername());
            outboxService.saveEvent("USER", user.getUid(), "PASSWORD_RESET",
                    objectMapper.writeValueAsString(payload),
                    LocalDateTime.now().plusMinutes(10));
        } catch (Exception e) {
            throw new CustomException(ErrorConstant.INTERNAL_SERVER_ERROR, "Failed to serialize outbox payload");
        }
    }

    public UserResponseDto getCurrentUser(String accessToken) {
        if(!jwtService.isAccessTokenValid(accessToken)) throw new BadCredentialsException("Invalid access token");
        Jwt jwt=jwtService.decode(accessToken);
        User user= (User) userDetailsServiceImpl.loadUserByUsername(Objects.requireNonNull(jwt.getSubject()));

        Set<String> permissions=new HashSet<>();
        Set<String> roleNames = new HashSet<>();
        if(user.getRoles()!=null){
            user.getRoles().forEach(role -> {
                roleNames.add(role.getRoleName());
                if(role.getPermissions()!=null){
                    role.getPermissions().forEach(p->permissions.add(p.getPermissionName()));
                }
            });
        }
        if(user.getPermissions()!=null){
            user.getPermissions().forEach(p->permissions.add(p.getPermissionName()));
        }

        com.bank.common.enums.KycStatus kycStatus = null;
        boolean kycVerified = false;
        com.bank.core.data.user.kyc.UserKyc kyc = userProfileRepository.findByUserId(user.getId())
                .flatMap(profile -> kycRepository.findByUserUserId(profile.getUserId()))
                .orElse(null);
        if (kyc != null) {
            kycStatus = kyc.getStatus() != null ? kyc.getStatus() : com.bank.common.enums.KycStatus.NOT_STARTED;
            kycVerified = com.bank.common.enums.VerificationStatus.VERIFIED == kyc.getBvnVerificationStatus()
                    && com.bank.common.enums.VerificationStatus.VERIFIED == kyc.getNinVerificationStatus();
        }

        return UserResponseDto.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .uid(user.getUid())
                .roleNames(roleNames)
                .permissions(permissions)
                .kycStatus(kycStatus != null ? kycStatus.name() : null)
                .kycVerified(kycVerified)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public LoginResponseDto refreshToken(String refreshToken) {
        if(!jwtService.
                isRefreshTokenValid(refreshToken)) throw new BadCredentialsException("Invalid refresh token");
        Jwt jwt=jwtService.decode(refreshToken);

        User user = (User) userDetailsServiceImpl.loadUserByUsername(Objects.requireNonNull(jwt.getSubject()));

        if (user.getLastLogoutDate() != null && jwt.getIssuedAt() != null
                && jwt.getIssuedAt().isBefore(user.getLastLogoutDate().atZone(ZoneId.systemDefault()).toInstant())) {
            throw new BadCredentialsException("Refresh token revoked");
        }

        Authentication authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

        Token token = new Token();
        token.setAccessToken(jwtService.generateAccessToken(authentication));
        token.setRefreshToken(refreshToken);

        return LoginResponseDto.builder().token(
                token
        ).build();

    }
}
