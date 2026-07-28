package com.localfood.service;

import com.localfood.model.AuthProvider;
import com.localfood.security.LocalOidcUser;
import com.localfood.security.OAuthLinkCookieService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final OAuthLinkIntentService linkIntentService;
    private final OAuthLinkCookieService linkCookieService;
    private final HttpServletRequest servletRequest;
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
        String linkToken = linkCookieService.read(servletRequest);
        boolean accountLinking = linkToken != null;
        var localUser = accountLinking
                ? linkIntentService.complete(linkToken, provider, subject, email)
                : accountLinkService.resolve(
                        provider,
                        subject,
                        email,
                        stringValue(claims.get("name")),
                        stringValue(claims.get("picture"))
                );
        return new LocalOidcUser(providerUser, localUser, provider, accountLinking);
    }

    private static String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
