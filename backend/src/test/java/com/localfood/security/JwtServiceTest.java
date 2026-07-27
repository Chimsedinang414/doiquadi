package com.localfood.security;

import com.localfood.config.JwtProperties;
import com.localfood.model.Role;
import com.localfood.model.User;
import io.jsonwebtoken.io.Encoders;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTest {
    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        byte[] secret = new byte[32];
        new SecureRandom().nextBytes(secret);
        JwtProperties properties = new JwtProperties();
        properties.setSecret(Encoders.BASE64.encode(secret));
        properties.setIssuer("test-issuer");
        properties.setAudience("test-audience");
        properties.setAccessTokenTtl(Duration.ofMinutes(15));
        properties.setRefreshTokenTtl(Duration.ofDays(7));
        jwtService = new JwtService(properties);
        jwtService.initializeKeys();
        user = User.builder()
                .authSubject("0d2308aa-ad36-481b-8104-f024b1651762")
                .roles(Set.of(Role.USER))
                .credentialsVersion(2)
                .build();
    }

    @Test
    void accessTokenContainsOnlyPublicSubjectAndRoles() {
        JwtService.TokenData parsed = jwtService.parseAccessToken(jwtService.generateAccessToken(user));

        assertEquals(user.getAuthSubject(), parsed.subject());
        assertEquals(Set.of("USER"), Set.copyOf(parsed.roles()));
        assertEquals(2, parsed.credentialsVersion());
    }

    @Test
    void refreshTokenCannotBeUsedAsAccessToken() {
        String refreshToken = jwtService.generateRefreshToken(user);

        assertThrows(BadCredentialsException.class, () -> jwtService.parseAccessToken(refreshToken));
    }
}
