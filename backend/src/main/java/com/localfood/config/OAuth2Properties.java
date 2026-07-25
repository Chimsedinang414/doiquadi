package com.localfood.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.oauth2")
public class OAuth2Properties {
    private String frontendRedirectUri;
    private boolean autoLinkVerifiedEmail;
    private boolean authorizationCookieSecure = true;
    private Duration authorizationCookieTtl = Duration.ofMinutes(5);
    private Duration loginCodeTtl = Duration.ofMinutes(1);
}
