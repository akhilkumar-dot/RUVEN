package com.founderbridge;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppConfig(
    JwtConfig jwt,
    StorageConfig storage,
    CookieConfig cookie,
    RateLimitConfig rateLimit
) {
    public record JwtConfig(
        String secret,
        long accessExpirySeconds,
        int refreshExpiryDays
    ) {}

    public record StorageConfig(
        String endpoint,
        String accessKey,
        String secretKey,
        String bucket,
        String region
    ) {}

    public record CookieConfig(String domain) {}

    public record RateLimitConfig(
        AuthLimit auth,
        ApiLimit api
    ) {
        public record AuthLimit(long capacity) {}
        public record ApiLimit(long capacity) {}
    }
}
