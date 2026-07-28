package com.localfood.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.localfood.config.OAuth2Properties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Base64;
import java.util.Collections;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class SignedCookieAuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {
    private static final String COOKIE_NAME = "LF_OAUTH2_REQUEST";
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();

    private final ObjectMapper objectMapper;
    private final JwtService jwtService;
    private final OAuth2Properties properties;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        String value = cookieValue(request);
        if (value == null) {
            return null;
        }
        try {
            String[] parts = value.split("\\.", 2);
            if (parts.length != 2) {
                return null;
            }
            byte[] json = DECODER.decode(parts[0]);
            byte[] suppliedSignature = DECODER.decode(parts[1]);
            if (!MessageDigest.isEqual(jwtService.signOAuthCookie(json), suppliedSignature)) {
                return null;
            }
            CookieRequest stored = objectMapper.readValue(json, CookieRequest.class);
            return OAuth2AuthorizationRequest.authorizationCode()
                    .authorizationUri(stored.authorizationUri())
                    .clientId(stored.clientId())
                    .redirectUri(stored.redirectUri())
                    .scopes(stored.scopes())
                    .state(stored.state())
                    .authorizationRequestUri(stored.authorizationRequestUri())
                    .additionalParameters(stored.additionalParameters())
                    .attributes(stored.attributes())
                    .build();
        } catch (Exception ignored) {
            return null;
        }
    }

    @Override
    public void saveAuthorizationRequest(
            OAuth2AuthorizationRequest authorizationRequest,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        if (authorizationRequest == null) {
            expireCookie(request, response);
            return;
        }
        try {
            CookieRequest stored = new CookieRequest(
                    authorizationRequest.getAuthorizationUri(),
                    authorizationRequest.getClientId(),
                    authorizationRequest.getRedirectUri(),
                    authorizationRequest.getScopes(),
                    authorizationRequest.getState(),
                    authorizationRequest.getAuthorizationRequestUri(),
                    authorizationRequest.getAdditionalParameters(),
                    authorizationRequest.getAttributes()
            );
            byte[] json = objectMapper.writeValueAsBytes(stored);
            String value = ENCODER.encodeToString(json) + "."
                    + ENCODER.encodeToString(jwtService.signOAuthCookie(json));
            if (value.length() > 3800) {
                throw new IllegalStateException("OAuth authorization request exceeds cookie limit");
            }
            addCookie(request, response, value, properties.getAuthorizationCookieTtl());
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to store OAuth authorization request", ex);
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        OAuth2AuthorizationRequest authorizationRequest = loadAuthorizationRequest(request);
        expireCookie(request, response);
        return authorizationRequest;
    }

    private String cookieValue(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void expireCookie(HttpServletRequest request, HttpServletResponse response) {
        addCookie(request, response, "", Duration.ZERO);
    }

    private void addCookie(
            HttpServletRequest request,
            HttpServletResponse response,
            String value,
            Duration maxAge
    ) {
        String path = request.getContextPath().isBlank() ? "/" : request.getContextPath();
        boolean secure = properties.isAuthorizationCookieSecure();
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(secure ? "None" : "Lax")
                .path(path)
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private record CookieRequest(
            String authorizationUri,
            String clientId,
            String redirectUri,
            Set<String> scopes,
            String state,
            String authorizationRequestUri,
            Map<String, Object> additionalParameters,
            Map<String, Object> attributes
    ) {
        private CookieRequest {
            scopes = scopes == null ? Collections.emptySet() : Set.copyOf(scopes);
            additionalParameters = additionalParameters == null
                    ? Collections.emptyMap() : Map.copyOf(additionalParameters);
            attributes = attributes == null ? Collections.emptyMap() : Map.copyOf(attributes);
        }
    }
}
