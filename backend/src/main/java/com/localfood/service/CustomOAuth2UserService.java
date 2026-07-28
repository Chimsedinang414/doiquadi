package com.localfood.service;

import com.localfood.model.AuthProvider;
import com.localfood.security.LocalOAuth2User;
import com.localfood.security.OAuthLinkCookieService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final SocialAccountLinkService accountLinkService;
    private final OAuthLinkIntentService linkIntentService;
    private final OAuthLinkCookieService linkCookieService;
    private final HttpServletRequest servletRequest;
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User providerUser = delegate.loadUser(request);
        String registrationId = request.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());
        Map<String, Object> attributes = providerUser.getAttributes();
        String subject = stringValue(attributes.get("id"));
        String email = stringValue(attributes.get("email"));
        String name = stringValue(attributes.get("name"));
        String avatar = facebookPicture(attributes);

        String linkToken = linkCookieService.read(servletRequest);
        boolean accountLinking = linkToken != null;
        var localUser = accountLinking
                ? linkIntentService.complete(linkToken, provider, subject, email)
                : accountLinkService.resolve(provider, subject, email, name, avatar);
        return new LocalOAuth2User(providerUser, localUser, provider, accountLinking);
    }

    @SuppressWarnings("unchecked")
    private static String facebookPicture(Map<String, Object> attributes) {
        Object picture = attributes.get("picture");
        if (picture instanceof Map<?, ?> pictureMap) {
            Object data = pictureMap.get("data");
            if (data instanceof Map<?, ?> dataMap) {
                return stringValue(dataMap.get("url"));
            }
        }
        return null;
    }

    private static String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
