package com.localfood.security;

import com.localfood.config.OAuth2Properties;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;

import static org.junit.jupiter.api.Assertions.assertEquals;

class OAuth2LoginFailureHandlerTest {
    @Test
    void redirectsWithSpecificErrorAndProvider() throws Exception {
        OAuth2Properties properties = new OAuth2Properties();
        properties.setFrontendRedirectUri("http://localhost:3000/oauth2/callback");
        OAuthLinkCookieService linkCookieService = new OAuthLinkCookieService(properties);
        MockHttpServletRequest request = new MockHttpServletRequest(
                "GET", "/api/login/oauth2/code/google");
        MockHttpServletResponse response = new MockHttpServletResponse();

        OAuth2LoginFailureHandler handler = new OAuth2LoginFailureHandler(properties, linkCookieService);
        handler.onAuthenticationFailure(
                request,
                response,
                new OAuth2AuthenticationException(new OAuth2Error("authorization_request_not_found"))
        );

        assertEquals(
                "http://localhost:3000/oauth2/callback?error=AUTHORIZATION_REQUEST_NOT_FOUND&provider=google",
                response.getRedirectedUrl());
    }
}
