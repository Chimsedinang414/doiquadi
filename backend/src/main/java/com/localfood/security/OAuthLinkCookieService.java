package com.localfood.security;

import com.localfood.config.OAuth2Properties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class OAuthLinkCookieService {
    static final String COOKIE_NAME = "LF_OAUTH2_LINK";

    private final OAuth2Properties properties;

    public String read(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (COOKIE_NAME.equals(cookie.getName()) && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }

    public void write(HttpServletRequest request, HttpServletResponse response, String token) {
        addCookie(request, response, token, properties.getLinkIntentTtl());
    }

    public void clear(HttpServletRequest request, HttpServletResponse response) {
        addCookie(request, response, "", Duration.ZERO);
    }

    private void addCookie(
            HttpServletRequest request,
            HttpServletResponse response,
            String value,
            Duration maxAge
    ) {
        String contextPath = request.getContextPath().isBlank() ? "" : request.getContextPath();
        String path = contextPath + "/login/oauth2/code";
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
}
