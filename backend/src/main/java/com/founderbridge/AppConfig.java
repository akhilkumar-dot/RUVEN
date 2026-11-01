package com.founderbridge;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Typed configuration properties bound from application.properties / env vars.
 * All app.* keys are mapped here.
 */
@ConfigurationProperties(prefix = "app")
public record AppConfig(
    Jwt jwt,
    Storage storage,
    Email email,
    Razorpay razorpay,
    Features features,
    Billing billing,
    RateLimit rateLimit,
    @DefaultValue("http://localhost:3000") String frontendUrl,
    @DefaultValue("http://localhost:8080") String backendUrl,
    @DefaultValue("localhost") String cookieDomain
) {
    public record Jwt(
        String secret,
        @DefaultValue("900")     long accessExpirySeconds,
        @DefaultValue("30")      int refreshExpiryDays
    ) {}

    public record Storage(
        @DefaultValue("http://localhost:9000") String endpoint,
        String accessKey,
        String secretKey,
        @DefaultValue("founderbridge") String bucket,
        @DefaultValue("us-east-1")     String region
    ) {}

    public record Email(
        @DefaultValue("noreply@founderbridge.local") String from,
        @DefaultValue("smtp") String provider,
        Resend resend
    ) {
        public record Resend(String apiKey) {}
    }

    public record Razorpay(String keyId, String keySecret, String webhookSecret, String proPlanId) {}

    public record Features(
        Oauth oauth,
        @DefaultValue("false") boolean webPush,
        @DefaultValue("false") boolean realtimeCodec
    ) {
        public record Oauth(
            @DefaultValue("false") boolean twitter,
            @DefaultValue("false") boolean github
        ) {}
    }

    public record Billing(
        @DefaultValue("19900") int proPricePaise,
        @DefaultValue("0.18")  double gstRate,
        @DefaultValue("true")  boolean gstInclusive
    ) {}

    public record RateLimit(
        Login login,
        Api api
    ) {
        public record Login(
            @DefaultValue("5")  int capacity,
            @DefaultValue("15") int refillMinutes
        ) {}
        public record Api(
            @DefaultValue("200") int capacity,
            @DefaultValue("60")  int refillSeconds
        ) {}
    }
}
