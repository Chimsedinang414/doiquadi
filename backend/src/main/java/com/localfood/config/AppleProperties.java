package com.localfood.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.apple")
public class AppleProperties {
    private String teamId;
    private String keyId;
    private String clientId;
    private String privateKey;
    private Duration clientSecretTtl = Duration.ofMinutes(5);
}
