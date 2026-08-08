package com.giftme.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.giftme.common.response.ApiResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Simple in-memory, per-client-IP rate limiter for the endpoints most exposed to abuse:
 * login (credential stuffing), order creation (spam orders / stock exhaustion) and uploads
 * (storage exhaustion). Deliberately not distributed - fine for a single-instance deployment;
 * a multi-instance deployment would need a shared store (e.g. Redis-backed Bucket4j) instead.
 *
 * <p>Not a {@code @Component}: it's registered explicitly as a bean inside the Spring Security
 * filter chain (see SecurityConfig), not via Spring Boot's automatic global filter
 * registration, to avoid it running twice per request.
 */
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        if (isRateLimited(request)) {
            Bucket bucket = buckets.computeIfAbsent(bucketKey(request), key -> newBucket());
            if (!bucket.tryConsume(1)) {
                response.setStatus(429);
                response.setContentType("application/json");
                ApiResponse<Void> body = ApiResponse.error(
                        "Too many requests - please try again shortly", "RATE_LIMIT_EXCEEDED", request.getRequestURI());
                objectMapper.writeValue(response.getWriter(), body);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String method = request.getMethod();
        return ("POST".equals(method) && "/api/auth/login".equals(uri))
                || ("POST".equals(method) && "/api/orders".equals(uri))
                || uri.startsWith("/api/uploads/");
    }

    private String bucketKey(HttpServletRequest request) {
        return request.getRemoteAddr() + ":" + request.getRequestURI();
    }

    private Bucket newBucket() {
        Bandwidth limit = Bandwidth.builder().capacity(20).refillGreedy(20, Duration.ofMinutes(1)).build();
        return Bucket.builder().addLimit(limit).build();
    }
}
