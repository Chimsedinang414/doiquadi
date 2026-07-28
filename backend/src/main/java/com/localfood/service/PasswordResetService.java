package com.localfood.service;

import com.localfood.config.PasswordResetProperties;
import com.localfood.dto.PasswordResetResponse;
import com.localfood.exception.ApiException;
import com.localfood.model.PasswordResetToken;
import com.localfood.model.User;
import com.localfood.repository.PasswordResetTokenRepository;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String GENERIC_REQUEST_MESSAGE =
            "Nếu email thuộc tài khoản đăng ký bằng mật khẩu, hướng dẫn đặt lại đã được gửi.";

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetProperties properties;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public PasswordResetResponse requestReset(String emailValue) {
        requireEnabled();
        String email = emailValue.trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmailForUpdate(email).orElse(null);

        // The same response is returned for unknown, disabled, and social-only accounts.
        if (user == null || !user.isEnabled() || user.getPassword() == null) {
            return new PasswordResetResponse(GENERIC_REQUEST_MESSAGE);
        }

        Instant now = Instant.now();
        PasswordResetToken latest = tokenRepository
                .findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .orElse(null);
        if (latest != null && latest.getCreatedAt() != null
                && latest.getCreatedAt().isAfter(now.minus(properties.getResendCooldown()))) {
            return new PasswordResetResponse(GENERIC_REQUEST_MESSAGE);
        }

        consumeOpenTokens(user.getId(), now);
        byte[] random = new byte[32];
        SECURE_RANDOM.nextBytes(random);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        tokenRepository.save(PasswordResetToken.builder()
                .tokenHash(sha256Hex(rawToken))
                .user(user)
                .expiresAt(now.plus(properties.getTokenTtl()))
                .build());
        eventPublisher.publishEvent(new PasswordResetRequestedEvent(
                user.getEmail(), user.getUserName(), rawToken));
        return new PasswordResetResponse(GENERIC_REQUEST_MESSAGE);
    }

    @Transactional
    public PasswordResetResponse resetPassword(String rawToken, String newPassword) {
        validateBcryptLength(newPassword);
        PasswordResetToken token = tokenRepository.findByTokenHash(sha256Hex(rawToken))
                .orElseThrow(PasswordResetService::invalidToken);
        Instant now = Instant.now();
        User user = token.getUser();
        if (token.getConsumedAt() != null
                || !token.getExpiresAt().isAfter(now)
                || !user.isEnabled()
                || user.getPassword() == null) {
            throw invalidToken();
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setCredentialsVersion(user.getCredentialsVersion() + 1);
        consumeOpenTokens(user.getId(), now);
        return new PasswordResetResponse("Mật khẩu đã được đặt lại. Vui lòng đăng nhập bằng mật khẩu mới.");
    }

    private void consumeOpenTokens(String userId, Instant consumedAt) {
        tokenRepository.findAllByUserIdAndConsumedAtIsNull(userId)
                .forEach(token -> token.setConsumedAt(consumedAt));
    }

    private void requireEnabled() {
        if (!properties.isEnabled()) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "PASSWORD_RESET_UNAVAILABLE",
                    "Chức năng khôi phục mật khẩu chưa được cấu hình gửi email"
            );
        }
    }

    private static void validateBcryptLength(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "PASSWORD_TOO_LONG",
                    "Mật khẩu không được vượt quá 72 byte UTF-8"
            );
        }
    }

    private static String sha256Hex(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }

    private static ApiException invalidToken() {
        return new ApiException(
                HttpStatus.BAD_REQUEST,
                "INVALID_PASSWORD_RESET_TOKEN",
                "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"
        );
    }
}
