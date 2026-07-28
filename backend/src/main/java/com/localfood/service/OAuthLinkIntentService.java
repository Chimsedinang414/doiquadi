package com.localfood.service;

import com.localfood.config.OAuth2Properties;
import com.localfood.exception.ApiException;
import com.localfood.model.AuthProvider;
import com.localfood.model.OAuthLinkIntent;
import com.localfood.model.User;
import com.localfood.repository.OAuthAccountRepository;
import com.localfood.repository.OAuthLinkIntentRepository;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.EnumSet;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OAuthLinkIntentService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Set<AuthProvider> SUPPORTED_PROVIDERS = EnumSet.of(AuthProvider.GOOGLE, AuthProvider.FACEBOOK);

    private final UserRepository userRepository;
    private final OAuthAccountRepository oauthAccountRepository;
    private final OAuthLinkIntentRepository linkIntentRepository;
    private final SocialAccountLinkService accountLinkService;
    private final OAuth2Properties properties;

    @Transactional
    public String start(String authSubject, int credentialsVersion, AuthProvider provider) {
        requireSupported(provider);
        User user = authenticatedUser(authSubject, credentialsVersion);
        if (oauthAccountRepository.existsByUserIdAndProvider(user.getId(), provider)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "PROVIDER_ALREADY_LINKED",
                    "This provider is already linked to your account");
        }

        byte[] random = new byte[32];
        SECURE_RANDOM.nextBytes(random);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        linkIntentRepository.save(OAuthLinkIntent.builder()
                .tokenHash(sha256Hex(rawToken))
                .user(user)
                .provider(provider)
                .expiresAt(Instant.now().plus(properties.getLinkIntentTtl()))
                .build());
        return rawToken;
    }

    @Transactional(readOnly = true)
    public Set<String> linkedProviders(String authSubject, int credentialsVersion) {
        User user = authenticatedUser(authSubject, credentialsVersion);
        return oauthAccountRepository.findAllByUserId(user.getId()).stream()
                .map(account -> account.getProvider().name().toLowerCase(Locale.ROOT))
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    @Transactional
    public User complete(
            String rawToken,
            AuthProvider provider,
            String providerSubject,
            String email) {
        OAuthLinkIntent intent = linkIntentRepository.findByTokenHash(sha256Hex(rawToken))
                .orElseThrow(() -> oauthError(
                        "INVALID_LINK_REQUEST",
                        "The account-linking request is invalid or expired"));
        Instant now = Instant.now();
        if (intent.getConsumedAt() != null || !intent.getExpiresAt().isAfter(now)) {
            throw oauthError("INVALID_LINK_REQUEST", "The account-linking request is invalid or expired");
        }
        if (intent.getProvider() != provider) {
            throw oauthError("LINK_PROVIDER_MISMATCH", "The account-linking provider does not match");
        }
        if (!intent.getUser().isEnabled()) {
            throw oauthError("ACCOUNT_DISABLED", "This account is disabled");
        }

        User linkedUser = accountLinkService.linkExisting(
                intent.getUser(), provider, providerSubject, email);
        intent.setConsumedAt(now);
        return linkedUser;
    }

    public AuthProvider parseProvider(String value) {
        try {
            AuthProvider provider = AuthProvider.valueOf(value.toUpperCase(Locale.ROOT));
            requireSupported(provider);
            return provider;
        } catch (IllegalArgumentException ex) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "UNSUPPORTED_OAUTH_PROVIDER",
                    "Only Google and Facebook account linking is supported");
        }
    }

    private User authenticatedUser(String authSubject, int credentialsVersion) {
        User user = userRepository.findByAuthSubject(authSubject)
                .filter(User::isEnabled)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED,
                        "INVALID_TOKEN",
                        "Authentication is invalid or expired"));
        if (user.getCredentialsVersion() != credentialsVersion) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "STALE_ACCESS_TOKEN",
                    "Please sign in again before linking an account");
        }
        return user;
    }

    private static void requireSupported(AuthProvider provider) {
        if (!SUPPORTED_PROVIDERS.contains(provider)) {
            throw new IllegalArgumentException("Unsupported OAuth provider");
        }
    }

    // private static void requirementSupmant(AuthProvider provider) {
    // if (!SUPPORTED_PROVIDERS.contains(provider)) {
    // throw new IllegalArgumentException("Unsupported OAuth provider");
    // }
    // }

    private static String sha256Hex(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }

    private static OAuth2AuthenticationException oauthError(String code, String description) {
        return new OAuth2AuthenticationException(new OAuth2Error(code), description);
    }
}
