package com.bank.core.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@SpringBootApplication(scanBasePackages = {"com.bank.core", "com.bank.common"})
@EnableWebSecurity
@EnableJpaRepositories(basePackages = "com.bank.core.data")
@EntityScan(basePackages = "com.bank.core.data")
@EnableConfigurationProperties
@ConfigurationPropertiesScan(basePackages = "com.bank.core.lib")
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class CoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoreApplication.class, args);
    }
}
