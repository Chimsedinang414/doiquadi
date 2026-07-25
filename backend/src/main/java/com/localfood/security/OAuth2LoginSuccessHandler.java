package com.localfood.security;

import com.localfood.config.OAuth2Properties;
import com.localfood.service.AuthenticationService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
    private final AuthenticationService authenticationService;
    private final OAuth2Properties properties;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        if (!(authentication.getPrincipal() instanceof LocalOAuthPrincipal principal)) {
            throw new ServletException("OAuth principal was not mapped to a local account");
        }
        String code = authenticationService.createOAuthLoginCode(principal.getLocalUser());
        String redirect = UriComponentsBuilder.fromUriString(properties.getFrontendRedirectUri())
                .queryParam("code", code)
                .build()
                .encode()
                .toUriString();
        response.sendRedirect(redirect);
    }
}
