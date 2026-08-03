package com.bank.core.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploads = Path.of("uploads", "avatars").toAbsolutePath();
        registry.addResourceHandler("/uploads/avatars/**")
                .addResourceLocations(uploads.toUri().toString());
    }
}
