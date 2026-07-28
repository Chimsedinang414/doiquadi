package com.localfood.service;

import com.localfood.config.OAuth2Properties;
import com.localfood.exception.ApiException;
import com.localfood.model.AuthProvider;
import com.localfood.model.OAuthLinkIntent;
import com.localfood.model.User;
import com.localfood.repository.OAuthAccountRepository;
import com.localfood.repository.OAuthLinkIntentRepository;
import com.localfood.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OAuthLinkIntentServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private OAuthAccountRepository oauthAccountRepository;
    @Mock
    private OAuthLinkIntentRepository linkIntentRepository;
    private OAuthLinkIntentService service;
    private SocialAccountLinkService accountLinkService;
    private User user;

    @BeforeEach
    void setUp() {
        OAuth2Properties properties = new OAuth2Properties();
        properties.setLinkIntentTtl(Duration.ofMinutes(5));
        accountLinkService = new SocialAccountLinkService(userRepository, oauthAccountRepository);
        service = new OAuthLinkIntentService(
                userRepository,
                oauthAccountRepository,
                linkIntentRepository,
                accountLinkService,
                properties
        );
        user = User.builder()
                .id("user-1")
                .authSubject("subject-1")
                .userName("person")
                .email("person@example.com")
                .credentialsVersion(3)
                .enabled(true)
                .build();
    }

    @Test
    void startStoresOnlyAHashOfTheRandomToken() {
        when(userRepository.findByAuthSubject("subject-1")).thenReturn(Optional.of(user));
        when(oauthAccountRepository.existsByUserIdAndProvider("user-1", AuthProvider.GOOGLE))
                .thenReturn(false);

        String rawToken = service.start("subject-1", 3, AuthProvider.GOOGLE);

        ArgumentCaptor<OAuthLinkIntent> intent = ArgumentCaptor.forClass(OAuthLinkIntent.class);
        verify(linkIntentRepository).save(intent.capture());
        assertFalse(rawToken.isBlank());
        assertEquals(64, intent.getValue().getTokenHash().length());
        assertNotEquals(rawToken, intent.getValue().getTokenHash());
        assertSame(user, intent.getValue().getUser());
        assertEquals(AuthProvider.GOOGLE, intent.getValue().getProvider());
        assertNotNull(intent.getValue().getExpiresAt());
    }

    @Test
    void completeConsumesIntentAndLinksTheExactAuthenticatedUser() {
        OAuthLinkIntent intent = OAuthLinkIntent.builder()
                .tokenHash("stored-hash")
                .user(user)
                .provider(AuthProvider.FACEBOOK)
                .expiresAt(Instant.now().plusSeconds(60))
                .build();
        when(linkIntentRepository.findByTokenHash(any())).thenReturn(Optional.of(intent));
        when(oauthAccountRepository.findByProviderAndProviderSubject(
                AuthProvider.FACEBOOK, "facebook-1")).thenReturn(Optional.empty());
        when(oauthAccountRepository.existsByUserIdAndProvider(
                "user-1", AuthProvider.FACEBOOK)).thenReturn(false);

        User result = service.complete("raw-token", AuthProvider.FACEBOOK, "facebook-1", null);

        assertSame(user, result);
        assertNotNull(intent.getConsumedAt());
        verify(oauthAccountRepository).saveAndFlush(any());
    }

    @Test
    void consumedIntentCannotBeReplayed() {
        OAuthLinkIntent intent = OAuthLinkIntent.builder()
                .tokenHash("stored-hash")
                .user(user)
                .provider(AuthProvider.GOOGLE)
                .expiresAt(Instant.now().plusSeconds(60))
                .consumedAt(Instant.now())
                .build();
        when(linkIntentRepository.findByTokenHash(any())).thenReturn(Optional.of(intent));

        OAuth2AuthenticationException exception = assertThrows(
                OAuth2AuthenticationException.class,
                () -> service.complete("raw-token", AuthProvider.GOOGLE, "google-1", "person@example.com")
        );

        assertEquals("INVALID_LINK_REQUEST", exception.getError().getErrorCode());
        verify(oauthAccountRepository, never()).saveAndFlush(any());
    }

    @Test
    void staleAccessTokenCannotStartSensitiveLinkingFlow() {
        when(userRepository.findByAuthSubject("subject-1")).thenReturn(Optional.of(user));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.start("subject-1", 2, AuthProvider.GOOGLE)
        );

        assertEquals("STALE_ACCESS_TOKEN", exception.getCode());
        verify(linkIntentRepository, never()).save(any());
    }
}
