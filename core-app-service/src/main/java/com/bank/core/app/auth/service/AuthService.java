package com.bank.core.app.auth.service;

import com.bank.common.dto.auth.LoginRequestDto;
import com.bank.common.dto.auth.LoginResponseDto;
import com.bank.common.dto.auth.SignupRequestDto;
import com.bank.common.dto.auth.Token;
import com.bank.common.dto.common.MessageDto;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import com.bank.core.lib.service.JwtService;
import com.github.f4b6a3.ulid.UlidCreator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponseDto loginUser(LoginRequestDto loginRequestDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequestDto.getUsername(), loginRequestDto.getPassword())
        );

        if(!authentication.isAuthenticated()) throw new BadCredentialsException("Invalid username or password");

        Token token= new Token();
        token.setAccessToken(jwtService.generateAccessToken(authentication));
        token.setRefreshToken(jwtService.generateRefreshToken(authentication));
        return LoginResponseDto.builder()
                .token(token)
                .build();

    }

    @Transactional
    public void signupUser(SignupRequestDto dto) {
        User user = new User();
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setAuthorities(Collections.emptyList());
        user.setUid(UlidCreator.getUlid().toString());
        userRepository.save(user);
    }
}
