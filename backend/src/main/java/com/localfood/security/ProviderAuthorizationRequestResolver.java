package com.localfood.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

import java.util.HashMap;

@Component
public class ProviderAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {
    private static final String BASE_URI = "/oauth2/authorization";
    private final DefaultOAuth2AuthorizationRequestResolver delegate;

    public ProviderAuthorizationRequestResolver(ClientRegistrationRepository registrations) {
        this.delegate = new DefaultOAuth2AuthorizationRequestResolver(registrations, BASE_URI);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        return customize(delegate.resolve(request));
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        return customize(delegate.resolve(request, clientRegistrationId));
    }

    private OAuth2AuthorizationRequest customize(OAuth2AuthorizationRequest authorizationRequest) {
        if (authorizationRequest == null
                || !"apple".equals(authorizationRequest.getAttribute("registration_id"))) {
            return authorizationRequest;
        }
        var parameters = new HashMap<>(authorizationRequest.getAdditionalParameters());
        parameters.put("response_mode", "form_post");
        return OAuth2AuthorizationRequest.from(authorizationRequest)
                .additionalParameters(parameters)
                .build();
    }
}
