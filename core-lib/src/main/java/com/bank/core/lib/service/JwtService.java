package com.bank.core.lib.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

public interface JwtService {

    String generateAccessToken(Authentication authentication);

    String generateRefreshToken(Authentication authentication);

    String extractUserId(String token);

    boolean isAccessTokenValid(String token);

    boolean isRefreshTokenValid(String token);

    Jwt decode(String token);

}