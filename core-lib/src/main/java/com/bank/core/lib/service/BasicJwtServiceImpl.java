package com.bank.core.lib.service;

import com.bank.core.data.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RequiredArgsConstructor
public class BasicJwtServiceImpl implements JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private static final String ACCESS_TOKEN = "access_token";
    private static final String REFRESH_TOKEN = "refresh_token";

    @Override
    public String generateAccessToken(Authentication authentication) {
        return generateToken(authentication,15,ACCESS_TOKEN);
    }

    @Override
    public String generateRefreshToken(Authentication authentication) {
        return generateToken(authentication,60,REFRESH_TOKEN);
    }

    @Override
    public String extractUserId(String token) {
        Jwt jwt = jwtDecoder.decode(token);
        return jwt.getSubject();
    }

    @Override
    public boolean isAccessTokenValid(String token) {
        try {
            Jwt jwt = jwtDecoder.decode(token);
            return ACCESS_TOKEN.equals(jwt.getClaim("type"));
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean isRefreshTokenValid(String token) {
        try{
            return REFRESH_TOKEN.equals(jwtDecoder.decode(token).getClaim("type"));
        }
        catch (Exception e){
            return false;
        }
    }

    @Override
    public Jwt decode(String token) {
        return jwtDecoder.decode(token);
    }

    private String generateToken(Authentication authentication,long exp,String type){
        Instant now = Instant.now();

        User user=(User) authentication.getPrincipal();

        assert user != null;

        List<String> authorities = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        List<String> roles = authorities.stream()
                .filter(a -> a.startsWith("ROLE_"))
                .toList();

        List<String> scopes = authorities.stream()
                .filter(a -> !a.startsWith("ROLE_") && !a.startsWith("FACTOR_"))
                .toList();

        List<String> factors= authorities.stream().filter(
                a->a.startsWith("FACTOR_")
        ).toList();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("banking-platform")
                .issuedAt(now)
                .subject(user.getUid())
                .claim("type", type)
                .claim("roles", roles)
                .claim("scopes", scopes)
                .claim("amr", factors)
                .expiresAt(now.plus(exp, ChronoUnit.MINUTES))
                .build();

        return jwtEncoder
                .encode(JwtEncoderParameters.from(claims))
                .getTokenValue();
    }
}
