package com.localfood.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.localfood.config.JwtProperties;
import com.localfood.config.OAuth2Properties;
import io.jsonwebtoken.io.Encoders;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class SignedCookieAuthorizationRequestRepositoryTest {
    private SignedCookieAuthorizationRequestRepository repository;

    @BeforeEach
    void setUp() {
        byte[] secret = new byte[32];
        new SecureRandom().nextBytes(secret);
        JwtProperties jwtProperties = new JwtProperties();
        jwtProperties.setSecret(Encoders.BASE64.encode(secret));
        jwtProperties.setIssuer("issuer");
        jwtProperties.setAudience("audience");
        JwtService jwtService = new JwtService(jwtProperties);
        jwtService.initializeKeys();

        OAuth2Properties oauthProperties = new OAuth2Properties();
        oauthProperties.setAuthorizationCookieSecure(true);
        oauthProperties.setAuthorizationCookieTtl(Duration.ofMinutes(5));
        repository = new SignedCookieAuthorizationRequestRepository(
                new ObjectMapper().findAndRegisterModules(), jwtService, oauthProperties);
    }

    @Test
    void signedCookieRoundTripsAuthorizationState() {
        OAuth2AuthorizationRequest authorization = request();
        MockHttpServletRequest originalRequest = new MockHttpServletRequest();
        originalRequest.setContextPath("/api");
        MockHttpServletResponse originalResponse = new MockHttpServletResponse();

        repository.saveAuthorizationRequest(authorization, originalRequest, originalResponse);
        Cookie cookie = responseCookie(originalResponse);
        MockHttpServletRequest callback = new MockHttpServletRequest();
        callback.setCookies(cookie);

        OAuth2AuthorizationRequest loaded = repository.loadAuthorizationRequest(callback);
        assertEquals("random-state", loaded.getState());
        assertEquals("google", loaded.getAttribute("registration_id"));
    }

    @Test
    void tamperedCookieIsRejected() {
        MockHttpServletRequest originalRequest = new MockHttpServletRequest();
        MockHttpServletResponse originalResponse = new MockHttpServletResponse();
        repository.saveAuthorizationRequest(request(), originalRequest, originalResponse);
        Cookie cookie = responseCookie(originalResponse);
        String value = cookie.getValue();
        cookie.setValue(value.substring(0, value.length() - 1)
                + (value.endsWith("A") ? "B" : "A"));
        MockHttpServletRequest callback = new MockHttpServletRequest();
        callback.setCookies(cookie);

        assertNull(repository.loadAuthorizationRequest(callback));
    }

    private static OAuth2AuthorizationRequest request() {
        return OAuth2AuthorizationRequest.authorizationCode()
                .authorizationUri("https://accounts.example/authorize")
                .clientId("client")
                .redirectUri("https://api.example/api/login/oauth2/code/google")
                .scopes(Set.of("openid", "email"))
                .state("random-state")
                .authorizationRequestUri("https://accounts.example/authorize?state=random-state")
                .additionalParameters(Map.of("nonce", "random-nonce"))
                .attributes(Map.of("registration_id", "google"))
                .build();
    }

    private static Cookie responseCookie(MockHttpServletResponse response) {
        String header = response.getHeader("Set-Cookie");
        String[] pair = header.substring(0, header.indexOf(';')).split("=", 2);
        return new Cookie(pair[0], pair[1]);
    }
}
