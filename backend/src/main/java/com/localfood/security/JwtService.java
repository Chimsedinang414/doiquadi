package com.localfood.security;

import com.localfood.config.JwtProperties;
import com.localfood.model.Role;
import com.localfood.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtService {
    private static final String ACCESS = "access";
    private static final String REFRESH = "refresh";

    private final JwtProperties properties;
    private SecretKey signingKey;
    private byte[] cookieSigningKey;

    @PostConstruct
    void initializeKeys() {
        byte[] decoded;
        try {
            decoded = Decoders.BASE64.decode(properties.getSecret());
        } catch (RuntimeException ex) {
            throw new IllegalStateException("JWT_SECRET must be valid Base64", ex);
        }
        if (decoded.length < 32) {
            throw new IllegalStateException("JWT_SECRET must decode to at least 32 random bytes");
        }
        signingKey = Keys.hmacShaKeyFor(decoded);
        cookieSigningKey = hmac(decoded, "localfood-oauth-cookie-v1".getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user) {
        List<String> roles = user.getRoles().stream().map(Role::name).sorted().toList();
        return generate(user, ACCESS, properties.getAccessTokenTtl(), roles);
    }

    public String generateRefreshToken(User user) {
        return generate(user, REFRESH, properties.getRefreshTokenTtl(), List.of());
    }

    public TokenData parseAccessToken(String token) {
        return parse(token, ACCESS);
    }

    public TokenData parseRefreshToken(String token) {
        return parse(token, REFRESH);
    }

    public long accessTokenTtlSeconds() {
        return properties.getAccessTokenTtl().toSeconds();
    }

    public byte[] signOAuthCookie(byte[] value) {
        return hmac(cookieSigningKey, value);
    }

    private String generate(User user, String type, Duration ttl, List<String> roles) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .issuer(properties.getIssuer())
                .subject(user.getAuthSubject())
                .audience().add(properties.getAudience()).and()
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .id(UUID.randomUUID().toString())
                .claim("type", type)
                .claim("ver", user.getCredentialsVersion());
        if (ACCESS.equals(type)) {
            builder.claim("roles", roles);
        }
        return builder.signWith(signingKey, Jwts.SIG.HS256).compact();
    }

    private TokenData parse(String token, String requiredType) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(properties.getIssuer())
                    .requireAudience(properties.getAudience())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            if (!requiredType.equals(claims.get("type", String.class))) {
                throw new BadCredentialsException("Wrong token type");
            }
            Collection<?> rawRoles = claims.get("roles", Collection.class);
            List<String> roles = rawRoles == null
                    ? List.of()
                    : rawRoles.stream().map(String::valueOf).toList();
            Integer version = claims.get("ver", Integer.class);
            return new TokenData(claims.getSubject(), roles, version == null ? 0 : version);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BadCredentialsException("Invalid or expired token", ex);
        }
    }

    private static byte[] hmac(byte[] key, byte[] value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(value);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to initialize HMAC", ex);
        }
    }

    public record TokenData(String subject, List<String> roles, int credentialsVersion) {
    }
}
