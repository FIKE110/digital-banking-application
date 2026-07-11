package com.bank.extern.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;

import java.util.List;

import static com.bank.common.constant.ApiConstant.*;

@Configuration
public class RouteConfig {

    private static final String CORE_HOST = "http://localhost:8081";

    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth routes (public, no auth required)
                .route("auth-service", r -> r
                        .path("/api/v1/auth/**")
                        .uri(CORE_HOST))

                // Account routes (user)
                .route("account-service", r -> r
                        .path("/api/v1/accounts/**")
                        .uri(CORE_HOST))

                // Transfer routes (user)
                .route("transfer-service", r -> r
                        .path("/api/v1/transfers/**")
                        .uri(CORE_HOST))

                // Ledger routes (user)
                .route("ledger-service", r -> r
                        .path("/api/v1/ledger/**")
                        .uri(CORE_HOST))

                // Profile routes (user)
                .route("profile-service", r -> r
                        .path("/api/v1/profile/**")
                        .uri(CORE_HOST))

                // Admin routes (admin only, secured by @PreAuthorize on controller)
                .route("admin-service", r -> r
                        .path("/api/v1/admin/**")
                        .uri(CORE_HOST))

                .build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsWebFilter(source);
    }
}