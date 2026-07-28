package com.localfood.service;

import com.localfood.config.OAuth2Properties;
import com.localfood.dto.AuthResponse;
import com.localfood.dto.LoginRequest;
import com.localfood.dto.RegisterRequest;
import com.localfood.dto.UserResponse;
import com.localfood.exception.ApiException;
import com.localfood.model.OAuthLoginCode;
import com.localfood.model.User;
import com.localfood.repository.OAuthLoginCodeRepository;
import com.localfood.repository.UserRepository;
import com.localfood.security.JwtService;
import com.localfood.security.AccountAccessPolicy;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
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
public class AuthenticationService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final OAuthLoginCodeRepository loginCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OAuth2Properties oauth2Properties;
    private String dummyPasswordHash;

    @PostConstruct
    void initializeDummyHash() {
        dummyPasswordHash = passwordEncoder.encode("not-a-user-password");
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        String userName = request.getUserName().trim();
        validateBcryptLength(request.getPassword());

        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_REGISTERED", "An account already uses this email");
        }
        if (userRepository.existsByUserName(userName)) {
            throw new ApiException(HttpStatus.CONFLICT, "USERNAME_ALREADY_USED", "This username is unavailable");
        }

        User user = User.builder()
                .userName(userName)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .bio(request.getBio())
                .enabled(true)
                .build();
        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {
            throw new ApiException(HttpStatus.CONFLICT, "ACCOUNT_CONFLICT", "Email or username is already registered");
        }
        return issueTokens(user, "Registration successful");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(email).orElse(null);
        String storedHash = user != null && user.getPassword() != null ? user.getPassword() : dummyPasswordHash;
        boolean invalidBcryptLength = request.getPassword().getBytes(StandardCharsets.UTF_8).length > 72;
        String passwordToCheck = invalidBcryptLength ? "invalid-password" : request.getPassword();
        boolean passwordMatches = passwordEncoder.matches(passwordToCheck, storedHash);

        if (invalidBcryptLength || user == null || user.getPassword() == null
                || !passwordMatches || !AccountAccessPolicy.isAllowed(user)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email or password is incorrect");
        }
        return issueTokens(user, "Login successful");
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(String refreshToken) {
        JwtService.TokenData token = jwtService.parseRefreshToken(refreshToken);
        User user = userRepository.findByAuthSubject(token.subject())
                .filter(AccountAccessPolicy::isAllowed)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "Refresh token is invalid"));
        if (user.getCredentialsVersion() != token.credentialsVersion()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "Refresh token is invalid");
        }
        return issueTokens(user, "Token refreshed");
    }

    @Transactional
    public String createOAuthLoginCode(User user) {
        byte[] random = new byte[32];
        SECURE_RANDOM.nextBytes(random);
        String rawCode = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        loginCodeRepository.save(OAuthLoginCode.builder()
                .codeHash(sha256Hex(rawCode))
                .user(user)
                .expiresAt(Instant.now().plus(oauth2Properties.getLoginCodeTtl()))
                .build());
        return rawCode;
    }

    @Transactional
    public AuthResponse exchangeOAuthCode(String rawCode) {
        OAuthLoginCode code = loginCodeRepository.findByCodeHash(sha256Hex(rawCode))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_OAUTH_CODE", "OAuth code is invalid or expired"));
        Instant now = Instant.now();
        if (code.getConsumedAt() != null || !code.getExpiresAt().isAfter(now)
                || !AccountAccessPolicy.isAllowed(code.getUser())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_OAUTH_CODE", "OAuth code is invalid or expired");
        }
        code.setConsumedAt(now);
        return issueTokens(code.getUser(), "OAuth login successful");
    }

    public AuthResponse issueTokens(User user, String message) {
        return AuthResponse.builder()
                .message(message)
                .tokenType("Bearer")
                .accessToken(jwtService.generateAccessToken(user))
                .refreshToken(jwtService.generateRefreshToken(user))
                .expiresIn(jwtService.accessTokenTtlSeconds())
                .user(toResponse(user))
                .build();
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static void validateBcryptLength(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PASSWORD_TOO_LONG", "Password must not exceed 72 UTF-8 bytes");
        }
    }

    private static String sha256Hex(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }

    private static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .userName(user.getUserName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .avatar(user.getAvatar())
                .address(user.getAddress())
                .dateOfBirth(user.getDateOfBirth())
                .bio(user.getBio())
                .createdAt(user.getCreatedAt())
                .roles(user.getRoles().stream().map(Enum::name).collect(java.util.stream.Collectors.toSet()))
                .build();
    }
}
