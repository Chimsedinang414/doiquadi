package com.localfood.controller;

import com.localfood.dto.OAuthLinkStartResponse;
import com.localfood.dto.OAuthLinkStatusResponse;
import com.localfood.model.AuthProvider;
import com.localfood.security.JwtService;
import com.localfood.security.OAuthLinkCookieService;
import com.localfood.service.OAuthLinkIntentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/oauth2/links")
@RequiredArgsConstructor
public class OAuthLinkController {
    private final OAuthLinkIntentService linkIntentService;
    private final OAuthLinkCookieService linkCookieService;

    @GetMapping
    public OAuthLinkStatusResponse status(Authentication authentication) {
        JwtService.TokenData token = tokenData(authentication);
        return new OAuthLinkStatusResponse(linkIntentService.linkedProviders(
                token.subject(), token.credentialsVersion()));
    }

    @PostMapping("/{provider}/start")
    public OAuthLinkStartResponse start(
            @PathVariable String provider,
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        JwtService.TokenData token = tokenData(authentication);
        AuthProvider authProvider = linkIntentService.parseProvider(provider);
        String linkToken = linkIntentService.start(
                token.subject(), token.credentialsVersion(), authProvider);
        linkCookieService.write(request, response, linkToken);
        return new OAuthLinkStartResponse(
                "/oauth2/authorization/" + authProvider.name().toLowerCase(java.util.Locale.ROOT));
    }

    private static JwtService.TokenData tokenData(Authentication authentication) {
        if (authentication != null && authentication.getCredentials() instanceof JwtService.TokenData token) {
            return token;
        }
        throw new org.springframework.security.authentication.BadCredentialsException(
                "A valid access token is required");
    }
}
