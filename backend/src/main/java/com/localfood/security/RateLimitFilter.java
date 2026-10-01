package com.localfood.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-memory, per-IP rate limiter for sensitive endpoints (login, register,
 * password reset, presigned upload). Uses a sliding window counter that resets
 * every {@link #WINDOW_SECONDS} seconds.
 *
 * <p>This is intentionally simple and does not require an external dependency
 * such as Redis. For a horizontally-scaled deployment behind a load balancer,
 * replace this with a distributed rate limiter (e.g. bucket4j + Redis).
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    /** Maximum requests per IP per window for rate-limited endpoints. */
    private static final int MAX_REQUESTS = 20;

    /** Window duration in seconds. */
    private static final int WINDOW_SECONDS = 60;

    /** Maximum number of tracked IPs before evicting stale entries. */
    private static final int MAX_TRACKED_IPS = 10_000;

    /**
     * URI prefixes (after context path {@code /api}) that are rate-limited.
     * Matched with {@link String#startsWith(String)}.
     */
    private static final Set<String> RATE_LIMITED_PATHS = Set.of(
            "/auth/login",
            "/auth/register",
            "/auth/password/forgot",
            "/auth/password/reset",
            "/uploads/presign"
    );

    private final ConcurrentHashMap<String, WindowCounter> counters = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (!isRateLimited(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        WindowCounter counter = counters.computeIfAbsent(clientIp, key -> new WindowCounter());

        if (counter.incrementAndCheck()) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"timestamp\":\"" + Instant.now() + "\","
                    + "\"status\":429,"
                    + "\"code\":\"RATE_LIMITED\","
                    + "\"message\":\"Quá nhiều yêu cầu. Vui lòng thử lại sau.\","
                    + "\"path\":\"" + request.getRequestURI() + "\"}");
        }

        evictStaleEntriesIfNeeded();
    }

    private boolean isRateLimited(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return false;
        }
        // servletPath is the path after context path (/api)
        String path = request.getServletPath();
        for (String prefix : RATE_LIMITED_PATHS) {
            if (path.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Resolves the real client IP, respecting reverse-proxy headers.
     * Picks the first address from X-Forwarded-For when present.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",", 2)[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    /** Prevents unbounded memory growth by clearing stale entries. */
    private void evictStaleEntriesIfNeeded() {
        if (counters.size() > MAX_TRACKED_IPS) {
            long now = epochSecond();
            counters.entrySet().removeIf(entry ->
                    now - entry.getValue().windowStart > WINDOW_SECONDS * 2L);
        }
    }

    private static long epochSecond() {
        return System.currentTimeMillis() / 1000;
    }

    /**
     * A simple sliding-window counter. The window resets automatically when
     * the current epoch second moves past {@code windowStart + WINDOW_SECONDS}.
     */
    static final class WindowCounter {
        volatile long windowStart = epochSecond();
        final AtomicInteger count = new AtomicInteger(0);

        /** @return {@code true} if the request is allowed. */
        boolean incrementAndCheck() {
            long now = epochSecond();
            if (now - windowStart >= WINDOW_SECONDS) {
                synchronized (this) {
                    if (now - windowStart >= WINDOW_SECONDS) {
                        windowStart = now;
                        count.set(0);
                    }
                }
            }
            return count.incrementAndGet() <= MAX_REQUESTS;
        }
    }
}
