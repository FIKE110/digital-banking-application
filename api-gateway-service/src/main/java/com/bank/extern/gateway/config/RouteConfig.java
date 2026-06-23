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
                .route("auth-service", r -> r
                        .path(AUTH_BASE + "/**")
                        .filters(f -> f.rewritePath(
                                AUTH_BASE.concat("/(?<segment>.*)"),
                                API_V1_PATH+AUTH_BASE.concat("/${segment}")
                        ))
                        .uri(CORE_HOST))
                .route("account-service", r -> r
                        .path(ACCOUNT_BASE + "/**")
                        .uri(CORE_HOST))
                .route("transfer-service", r -> r
                        .path(TRANSFER_BASE + "/**")
                        .uri(CORE_HOST))
                .route("ledger-service", r -> r
                        .path(LEDGER_BASE + "/**")
                        .uri(CORE_HOST))
                .route("profile-service", r -> r
                        .path(PROFILE_BASE + "/**")
                        .uri(CORE_HOST))
                .route("admin-service", r -> r
                        .path(ADMIN_BASE + "/**")
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
