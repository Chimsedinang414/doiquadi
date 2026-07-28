package com.localfood.service;

import com.localfood.config.PasswordResetProperties;
import com.localfood.exception.ApiException;
import com.localfood.model.PasswordResetToken;
import com.localfood.model.User;
import com.localfood.repository.PasswordResetTokenRepository;
import com.localfood.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PasswordResetServiceTest {
    private UserRepository userRepository;
    private PasswordResetTokenRepository tokenRepository;
    private PasswordEncoder passwordEncoder;
    private ApplicationEventPublisher eventPublisher;
    private PasswordResetProperties properties;
    private PasswordResetService service;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        tokenRepository = mock(PasswordResetTokenRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        eventPublisher = mock(ApplicationEventPublisher.class);
        properties = new PasswordResetProperties();
        properties.setEnabled(true);
        properties.setTokenTtl(Duration.ofMinutes(15));
        properties.setResendCooldown(Duration.ofMinutes(1));
        service = new PasswordResetService(
                userRepository, tokenRepository, passwordEncoder, properties, eventPublisher);
    }

    @Test
    void unknownAndSocialOnlyAccountsReturnTheSameResponseWithoutSendingMail() {
        when(userRepository.findByEmailForUpdate("unknown@example.com")).thenReturn(Optional.empty());
        User socialOnly = localUser();
        socialOnly.setPassword(null);
        when(userRepository.findByEmailForUpdate("social@example.com"))
                .thenReturn(Optional.of(socialOnly));

        String unknownMessage = service.requestReset(" UNKNOWN@example.com ").message();
        String socialMessage = service.requestReset("social@example.com").message();

        assertThat(socialMessage).isEqualTo(unknownMessage);
        verify(tokenRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void eligibleRequestStoresOnlyHashAndPublishesRawTokenAfterPersistence() {
        User user = localUser();
        when(userRepository.findByEmailForUpdate(user.getEmail())).thenReturn(Optional.of(user));
        when(tokenRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId()))
                .thenReturn(Optional.empty());
        when(tokenRepository.findAllByUserIdAndConsumedAtIsNull(user.getId()))
                .thenReturn(List.of());

        service.requestReset(user.getEmail());

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        ArgumentCaptor<Object> eventCaptor = ArgumentCaptor.forClass(Object.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        verify(eventPublisher).publishEvent(eventCaptor.capture());

        PasswordResetToken persisted = tokenCaptor.getValue();
        PasswordResetRequestedEvent event = (PasswordResetRequestedEvent) eventCaptor.getValue();
        assertThat(persisted.getTokenHash()).hasSize(64).doesNotContain(event.rawToken());
        assertThat(event.rawToken()).hasSizeGreaterThanOrEqualTo(43);
        assertThat(event.email()).isEqualTo(user.getEmail());
        assertThat(persisted.getUser()).isSameAs(user);
        assertThat(persisted.getExpiresAt()).isAfter(Instant.now().plus(Duration.ofMinutes(14)));
    }

    @Test
    void resendCooldownDoesNotCreateAnotherTokenOrEmail() {
        User user = localUser();
        PasswordResetToken latest = PasswordResetToken.builder()
                .user(user)
                .createdAt(Instant.now().minusSeconds(10))
                .expiresAt(Instant.now().plusSeconds(890))
                .build();
        when(userRepository.findByEmailForUpdate(user.getEmail())).thenReturn(Optional.of(user));
        when(tokenRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId()))
                .thenReturn(Optional.of(latest));

        service.requestReset(user.getEmail());

        verify(tokenRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void validTokenChangesPasswordConsumesTokensAndInvalidatesExistingSessions() {
        User user = localUser();
        user.setCredentialsVersion(7);
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .tokenHash("stored-hash")
                .expiresAt(Instant.now().plusSeconds(600))
                .build();
        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(tokenRepository.findAllByUserIdAndConsumedAtIsNull(user.getId()))
                .thenReturn(List.of(token));
        when(passwordEncoder.encode("a-secure-new-password"))
                .thenReturn("encoded-new-password");

        service.resetPassword("one-time-token", "a-secure-new-password");

        assertThat(user.getPassword()).isEqualTo("encoded-new-password");
        assertThat(user.getCredentialsVersion()).isEqualTo(8);
        assertThat(token.getConsumedAt()).isNotNull();
        verify(tokenRepository).findByTokenHash(anyString());
    }

    @Test
    void expiredOrConsumedTokenIsRejectedWithoutChangingPassword() {
        User user = localUser();
        String oldPassword = user.getPassword();
        PasswordResetToken expired = PasswordResetToken.builder()
                .user(user)
                .tokenHash("stored-hash")
                .expiresAt(Instant.now().minusSeconds(1))
                .build();
        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> service.resetPassword("expired-token", "a-secure-new-password"))
                .isInstanceOfSatisfying(ApiException.class,
                        error -> assertThat(error.getCode()).isEqualTo("INVALID_PASSWORD_RESET_TOKEN"));
        assertThat(user.getPassword()).isEqualTo(oldPassword);
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void requestingResetWhileMailFeatureIsDisabledFailsExplicitly() {
        properties.setEnabled(false);

        assertThatThrownBy(() -> service.requestReset("person@example.com"))
                .isInstanceOfSatisfying(ApiException.class, error -> {
                    assertThat(error.getCode()).isEqualTo("PASSWORD_RESET_UNAVAILABLE");
                    assertThat(error.getStatus().value()).isEqualTo(503);
                });
        verify(userRepository, never()).findByEmailForUpdate(anyString());
    }

    private static User localUser() {
        return User.builder()
                .id("user-1")
                .authSubject("subject-1")
                .userName("local-user")
                .email("person@example.com")
                .password("encoded-old-password")
                .enabled(true)
                .build();
    }
}
