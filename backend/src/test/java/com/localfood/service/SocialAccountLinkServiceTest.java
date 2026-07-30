package com.localfood.service;

import com.localfood.model.AuthProvider;
import com.localfood.model.OAuthAccount;
import com.localfood.model.User;
import com.localfood.repository.OAuthAccountRepository;
import com.localfood.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SocialAccountLinkServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private OAuthAccountRepository oauthAccountRepository;
    @InjectMocks
    private SocialAccountLinkService service;

    @Test
    void unverifiedExistingEmailRequiresExplicitLinking() {
        User localUser = user("local-user", "person@example.com");
        when(oauthAccountRepository.findByProviderAndProviderSubject(AuthProvider.GOOGLE, "google-1"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmailForUpdate("person@example.com"))
                .thenReturn(Optional.of(localUser));

        OAuth2AuthenticationException exception = assertThrows(
                OAuth2AuthenticationException.class,
                () -> service.resolve(
                        AuthProvider.GOOGLE,
                        "google-1",
                        "Person@Example.com",
                        false,
                        null
                )
        );

        assertEquals("ACCOUNT_LINKING_REQUIRED", exception.getError().getErrorCode());
        verify(oauthAccountRepository, never()).saveAndFlush(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void verifiedGoogleEmailAutomaticallyLinksExistingUser() {
        User localUser = user("local-user", "person@example.com");
        when(oauthAccountRepository.findByProviderAndProviderSubject(AuthProvider.GOOGLE, "google-1"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmailForUpdate("person@example.com"))
                .thenReturn(Optional.of(localUser));
        when(oauthAccountRepository.existsByUserIdAndProvider("local-user", AuthProvider.GOOGLE))
                .thenReturn(false);

        User result = service.resolve(
                AuthProvider.GOOGLE,
                "google-1",
                "Person@Example.com",
                true,
                null
        );

        assertSame(localUser, result);
        ArgumentCaptor<OAuthAccount> account = ArgumentCaptor.forClass(OAuthAccount.class);
        verify(oauthAccountRepository).saveAndFlush(account.capture());
        assertEquals(AuthProvider.GOOGLE, account.getValue().getProvider());
        assertEquals("google-1", account.getValue().getProviderSubject());
        assertEquals("person@example.com", account.getValue().getEmailAtProvider());
        assertSame(localUser, account.getValue().getUser());
    }

    @Test
    void explicitLinkUsesStableProviderSubjectAndAllowsMissingEmail() {
        User localUser = user("local-user", "person@example.com");
        when(oauthAccountRepository.findByProviderAndProviderSubject(AuthProvider.FACEBOOK, "facebook-1"))
                .thenReturn(Optional.empty());
        when(oauthAccountRepository.existsByUserIdAndProvider("local-user", AuthProvider.FACEBOOK))
                .thenReturn(false);

        User result = service.linkExisting(
                localUser, AuthProvider.FACEBOOK, "facebook-1", null);

        assertSame(localUser, result);
        ArgumentCaptor<OAuthAccount> account = ArgumentCaptor.forClass(OAuthAccount.class);
        verify(oauthAccountRepository).saveAndFlush(account.capture());
        assertEquals(AuthProvider.FACEBOOK, account.getValue().getProvider());
        assertEquals("facebook-1", account.getValue().getProviderSubject());
        assertNull(account.getValue().getEmailAtProvider());
        assertSame(localUser, account.getValue().getUser());
    }

    @Test
    void identityAlreadyOwnedByAnotherUserCannotBeLinked() {
        User localUser = user("local-user", "local@example.com");
        User otherUser = user("other-user", "other@example.com");
        OAuthAccount existing = OAuthAccount.builder()
                .provider(AuthProvider.GOOGLE)
                .providerSubject("google-1")
                .user(otherUser)
                .build();
        when(oauthAccountRepository.findByProviderAndProviderSubject(AuthProvider.GOOGLE, "google-1"))
                .thenReturn(Optional.of(existing));

        OAuth2AuthenticationException exception = assertThrows(
                OAuth2AuthenticationException.class,
                () -> service.linkExisting(
                        localUser, AuthProvider.GOOGLE, "google-1", "local@example.com")
        );

        assertEquals("OAUTH_IDENTITY_IN_USE", exception.getError().getErrorCode());
        verify(oauthAccountRepository, never()).saveAndFlush(org.mockito.ArgumentMatchers.any());
    }

    private static User user(String id, String email) {
        return User.builder()
                .id(id)
                .authSubject(id + "-subject")
                .userName(id)
                .email(email)
                .enabled(true)
                .build();
    }
}
