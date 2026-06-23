package com.bank.core.lib.props;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;


@ConfigurationProperties(prefix = "app.jwt")
@Data
public class JwtConfigProps {
    private String key;
}
