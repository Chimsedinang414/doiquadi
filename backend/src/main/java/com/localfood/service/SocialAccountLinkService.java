package com.localfood.service;

import com.localfood.config.OAuth2Properties;
import com.localfood.model.AuthProvider;
import com.localfood.model.OAuthAccount;
import com.localfood.model.Role;
import com.localfood.model.User;
import com.localfood.repository.OAuthAccountRepository;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SocialAccountLinkService {
    private final UserRepository userRepository;
    private final OAuthAccountRepository oauthAccountRepository;
    private final OAuth2Properties properties;

    @Transactional
    public User resolve(
            AuthProvider provider,
            String providerSubject,
            String emailValue,
            boolean emailVerified,
            String displayName,
            String avatar
    ) {
        if (providerSubject == null || providerSubject.isBlank()) {
            throw oauthError("INVALID_PROVIDER_IDENTITY", "The provider did not return a stable subject");
        }

        OAuthAccount existingIdentity = oauthAccountRepository
                .findByProviderAndProviderSubject(provider, providerSubject)
                .orElse(null);
        if (existingIdentity != null) {
            if (!existingIdentity.getUser().isEnabled()) {
                throw oauthError("ACCOUNT_DISABLED", "This account is disabled");
            }
            return existingIdentity.getUser();
        }

        if (emailValue == null || emailValue.isBlank()) {
            throw oauthError("OAUTH_EMAIL_REQUIRED", "The provider did not return an email address");
        }
        String email = emailValue.trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmailForUpdate(email).orElse(null);

        if (user != null) {
            if (!properties.isAutoLinkVerifiedEmail() || !emailVerified) {
                throw oauthError(
                        "ACCOUNT_LINKING_REQUIRED",
                        "An account already uses this email. Sign in to that account before linking this provider"
                );
            }
            if (oauthAccountRepository.existsByUserIdAndProvider(user.getId(), provider)) {
                throw oauthError("PROVIDER_ALREADY_LINKED", "This account is already linked to another provider identity");
            }
        } else {
            user = User.builder()
                    .userName(uniqueUserName(displayName, email, providerSubject))
                    .email(email)
                    .avatar(avatar)
                    .password(null)
                    .roles(Set.of(Role.USER))
                    .enabled(true)
                    .build();
            try {
                userRepository.saveAndFlush(user);
            } catch (DataIntegrityViolationException ex) {
                throw oauthError("OAUTH_ACCOUNT_CONFLICT", "An account was created concurrently; please sign in again");
            }
        }

        try {
            oauthAccountRepository.saveAndFlush(OAuthAccount.builder()
                    .provider(provider)
                    .providerSubject(providerSubject)
                    .emailAtProvider(email)
                    .user(user)
                    .build());
        } catch (DataIntegrityViolationException ex) {
            throw oauthError("OAUTH_LINK_CONFLICT", "The social identity was linked concurrently; please sign in again");
        }
        return user;
    }

    private String uniqueUserName(String displayName, String email, String subject) {
        String source = displayName == null || displayName.isBlank() ? email.substring(0, email.indexOf('@')) : displayName;
        String base = source.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9._-]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        if (base.length() < 3) {
            base = "user";
        }
        if (base.length() > 40) {
            base = base.substring(0, 40);
        }
        String candidate = base;
        String suffix = subject.replaceAll("[^A-Za-z0-9]", "");
        suffix = suffix.substring(Math.max(0, suffix.length() - Math.min(8, suffix.length()))).toLowerCase(Locale.ROOT);
        if (userRepository.existsByUserName(candidate)) {
            candidate = base + "-" + suffix;
        }
        return candidate.length() > 50 ? candidate.substring(0, 50) : candidate;
    }

    private static OAuth2AuthenticationException oauthError(String code, String description) {
        return new OAuth2AuthenticationException(new OAuth2Error(code), description);
    }
}
