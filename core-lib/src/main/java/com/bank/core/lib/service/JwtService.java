package com.bank.core.lib.service;

import org.springframework.security.core.Authentication;

public interface JwtService {

    String generateAccessToken(Authentication authentication);

    String generateRefreshToken(Authentication authentication);

    String extractUserId(String token);

    boolean isAccessTokenValid(String token);

    boolean isRefreshTokenValid(String token);

}