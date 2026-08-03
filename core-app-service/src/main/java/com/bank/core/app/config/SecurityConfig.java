package com.bank.core.app.config;

import com.bank.common.constant.AlgorithmConstants;
import com.bank.core.lib.props.JwtConfigProps;
import com.bank.core.lib.service.BasicJwtServiceImpl;
import com.bank.core.lib.service.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;

import static com.bank.common.constant.ApiConstant.*;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${springdoc.api-docs.path}")
    private String swaggerDocUrl;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    AuditorAware<String> auditorAware() {
        return ()->  {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if (auth == null || !auth.isAuthenticated()) {
                return Optional.of("SYSTEM");
            }

            return Optional.ofNullable(auth.getName());
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        JwtGrantedAuthoritiesConverter scopesConverter = new JwtGrantedAuthoritiesConverter();
        scopesConverter.setAuthorityPrefix("");
        scopesConverter.setAuthoritiesClaimName("scopes");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(scopesConverter);

        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authz->authz
                        .requestMatchers(API_V1_PATH+AUTH_BASE.concat("/**")).permitAll()
                        .requestMatchers(DOC_BASE_PATH.concat("/**")).permitAll()
                        .requestMatchers(swaggerDocUrl).permitAll()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(authenticationConverter)))
                .sessionManagement(ses->ses.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }

    @Bean
    public JwtDecoder jwtDecoder(JwtConfigProps jwtConfigProps) throws NoSuchAlgorithmException {
        return NimbusJwtDecoder.withSecretKey(
                new SecretKeySpec(jwtConfigProps.getKey().getBytes(), AlgorithmConstants.HMAC_SHA256)
        ).build();
    }

    @Bean
    public JwtEncoder jwtEncoder(JwtConfigProps jwtConfigProps) throws NoSuchAlgorithmException {
        return NimbusJwtEncoder.withSecretKey(
                new SecretKeySpec(jwtConfigProps.getKey().getBytes(), AlgorithmConstants.HMAC_SHA256)
        ).build();
    }

    @Bean
    JwtService jwtService(JwtEncoder encoder, JwtDecoder decoder) throws NoSuchAlgorithmException {
        return new BasicJwtServiceImpl(encoder,decoder);
    }

}
