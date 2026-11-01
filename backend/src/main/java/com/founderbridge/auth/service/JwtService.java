package com.founderbridge.auth.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class JwtService {

    private final Key key;
    private final long accessExpirySeconds;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-expiry-seconds:900}") long accessExpirySeconds) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessExpirySeconds = accessExpirySeconds;
    }

    /** Generate a signed access JWT for the given user. */
    public String generateAccessToken(UUID userId, String email, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .claims(Map.of("email", email, "role", role))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessExpirySeconds)))
                .signWith(key)
                .compact();
    }

    /** Validate and parse the JWT. Returns null if invalid/expired. */
    public Claims validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith((javax.crypto.SecretKey) key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException ex) {
            log.debug("JWT validation failed: {}", ex.getMessage());
            return null;
        }
    }

    public long getAccessExpirySeconds() {
        return accessExpirySeconds;
    }
}
