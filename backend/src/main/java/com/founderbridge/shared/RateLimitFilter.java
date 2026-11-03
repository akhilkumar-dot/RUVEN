package com.founderbridge.shared;

import io.github.bucket4j.*;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.*;
import io.lettuce.core.api.StatefulRedisConnection;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;

/**
 * Token-bucket rate limiter using Bucket4j backed by Redis.
 * Limits per IP:
 *  - Auth endpoints (register/login/forgot-password): 10 req/min
 *  - API endpoints:  120 req/min
 *  - Everything else: passthrough
 */
@Slf4j
@Component
public class RateLimitFilter extends GenericFilter {

    private static final List<String> AUTH_PREFIXES = List.of(
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/auth/forgot-password"
    );

    private final LettuceBasedProxyManager<byte[]> proxyManager;

    @Value("${app.rate-limit.auth.capacity:10}")
    private long authCapacity;
    @Value("${app.rate-limit.api.capacity:120}")
    private long apiCapacity;

    public RateLimitFilter(StatefulRedisConnection<String, byte[]> redisConnection) {
        this.proxyManager = LettuceBasedProxyManager.builderFor(redisConnection).build();
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        String path = request.getRequestURI();

        // Only rate-limit API paths
        if (!path.startsWith("/api/")) {
            chain.doFilter(req, res);
            return;
        }

        String ip = getClientIp(request);
        boolean isAuth = AUTH_PREFIXES.stream().anyMatch(path::startsWith);

        String bucketKey = (isAuth ? "rl:auth:" : "rl:api:") + ip;
        long capacity = isAuth ? authCapacity : apiCapacity;

        Bucket bucket = proxyManager.builder()
            .build(bucketKey.getBytes(),
                () -> BucketConfiguration.builder()
                    .addLimit(Bandwidth.builder()
                        .capacity(capacity)
                        .refillGreedy(capacity, Duration.ofMinutes(1))
                        .build())
                    .build());

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
        response.setHeader("X-RateLimit-Limit", String.valueOf(capacity));

        if (!probe.isConsumed()) {
            long retryAfterSecs = probe.getNanosToWaitForRefill() / 1_000_000_000L;
            response.setHeader("Retry-After", String.valueOf(retryAfterSecs));
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("""
                {"status":429,"title":"Too Many Requests",
                 "detail":"Rate limit exceeded. Retry after %d seconds.",
                 "code":"RATE_LIMITED"}""".formatted(retryAfterSecs));
            log.warn("Rate limit hit: ip={} path={}", ip, path);
            return;
        }

        chain.doFilter(req, res);
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
