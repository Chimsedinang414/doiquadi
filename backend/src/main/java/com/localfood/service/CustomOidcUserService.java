package com.localfood.service;

import com.localfood.model.AuthProvider;
import com.localfood.security.LocalOidcUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {
    private final SocialAccountLinkService accountLinkService;
    private final OidcUserService delegate = new OidcUserService();

    @Override
    public OidcUser loadUser(OidcUserRequest request) throws OAuth2AuthenticationException {
        // The delegate verifies signature, issuer, audience, expiry, and nonce before
        // any identity data reaches account-linking code.
        OidcUser providerUser = delegate.loadUser(request);
        AuthProvider provider = AuthProvider.valueOf(
                request.getClientRegistration().getRegistrationId().toUpperCase()
        );
        Map<String, Object> claims = providerUser.getClaims();
        String subject = stringValue(claims.get("sub"));
        String email = stringValue(claims.get("email"));
        boolean emailVerified = booleanValue(claims.get("email_verified"));
        if (provider == AuthProvider.APPLE && email != null) {
            // Apple documents the requested email as verified (including relay addresses).
            emailVerified = true;
        }
        var localUser = accountLinkService.resolve(
                provider,
                subject,
                email,
                emailVerified,
                stringValue(claims.get("name")),
                stringValue(claims.get("picture"))
        );
        return new LocalOidcUser(providerUser, localUser);
    }

    private static boolean booleanValue(Object value) {
        return Boolean.TRUE.equals(value) || "true".equalsIgnoreCase(String.valueOf(value));
    }

    private static String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
