package com.localfood.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.password-reset")
public class PasswordResetProperties {
    private boolean enabled;
    private String frontendResetUri = "http://localhost:3000/reset-password";
    private String mailFrom;
    private Duration tokenTtl = Duration.ofMinutes(15);
    private Duration resendCooldown = Duration.ofMinutes(1);
}
