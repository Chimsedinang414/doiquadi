package com.localfood.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.http.RequestEntity;
import org.springframework.security.oauth2.client.endpoint.DefaultAuthorizationCodeTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequestEntityConverter;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.stereotype.Component;

@Component
public class AppleAuthorizationCodeTokenResponseClient
        implements OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> {
    private final DefaultAuthorizationCodeTokenResponseClient delegate =
            new DefaultAuthorizationCodeTokenResponseClient();

    public AppleAuthorizationCodeTokenResponseClient(AppleClientSecretGenerator appleClientSecretGenerator) {
        OAuth2AuthorizationCodeGrantRequestEntityConverter defaultConverter =
                new OAuth2AuthorizationCodeGrantRequestEntityConverter();
        Converter<OAuth2AuthorizationCodeGrantRequest, RequestEntity<?>> converter = request -> {
            OAuth2AuthorizationCodeGrantRequest effectiveRequest = request;
            if ("apple".equals(request.getClientRegistration().getRegistrationId())) {
                String clientSecret = appleClientSecretGenerator.isConfigured()
                        ? appleClientSecretGenerator.generate()
                        : "unconfigured";
                ClientRegistration registration = ClientRegistration
                        .withClientRegistration(request.getClientRegistration())
                        .clientSecret(clientSecret)
                        .build();
                effectiveRequest = new OAuth2AuthorizationCodeGrantRequest(
                        registration,
                        request.getAuthorizationExchange()
                );
            }
            return defaultConverter.convert(effectiveRequest);
        };
        delegate.setRequestEntityConverter(converter);
    }

    @Override
    public OAuth2AccessTokenResponse getTokenResponse(OAuth2AuthorizationCodeGrantRequest request) {
        return delegate.getTokenResponse(request);
    }
}
