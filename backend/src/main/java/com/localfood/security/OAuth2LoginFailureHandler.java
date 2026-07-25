package com.localfood.security;

import com.localfood.config.OAuth2Properties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {
    private final OAuth2Properties properties;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {
        String code = "OAUTH2_AUTHENTICATION_FAILED";
        if (exception instanceof OAuth2AuthenticationException oauthException) {
            String candidate = oauthException.getError().getErrorCode().toUpperCase(Locale.ROOT);
            if (candidate.matches("[A-Z0-9_]{3,64}")) {
                code = candidate;
            }
        }
        String redirect = UriComponentsBuilder.fromUriString(properties.getFrontendRedirectUri())
                .queryParam("error", code)
                .build()
                .encode()
                .toUriString();
        response.sendRedirect(redirect);
    }
}
