package com.localfood.security;

import com.localfood.config.OAuth2Properties;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OAuthLinkCookieServiceTest {
    private OAuthLinkCookieService service;

    @BeforeEach
    void setUp() {
        OAuth2Properties properties = new OAuth2Properties();
        properties.setAuthorizationCookieSecure(true);
        properties.setLinkIntentTtl(Duration.ofMinutes(5));
        service = new OAuthLinkCookieService(properties);
    }

    @Test
    void linkTokenIsStoredInShortLivedHttpOnlySecureCookie() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setContextPath("/api");
        MockHttpServletResponse response = new MockHttpServletResponse();

        service.write(request, response, "secret-link-token");

        String header = response.getHeader("Set-Cookie");
        assertTrue(header.contains("LF_OAUTH2_LINK=secret-link-token"));
        assertTrue(header.contains("Path=/api/login/oauth2/code"));
        assertTrue(header.contains("Max-Age=300"));
        assertTrue(header.contains("Secure"));
        assertTrue(header.contains("HttpOnly"));
        assertTrue(header.contains("SameSite=None"));
    }

    @Test
    void readsOnlyTheDedicatedLinkCookie() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(
                new Cookie("other", "ignored"),
                new Cookie("LF_OAUTH2_LINK", "secret-link-token")
        );

        assertEquals("secret-link-token", service.read(request));
    }
}
