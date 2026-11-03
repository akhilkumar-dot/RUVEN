package com.founderbridge.auth.service;

import com.founderbridge.AppConfig;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final AppConfig appConfig;

    private SecretKey key() {
        byte[] bytes = appConfig.jwt().secret().getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) throw new IllegalStateException("JWT secret must be ≥ 32 chars");
        return Keys.hmacShaKeyFor(bytes);
    }

    public String generateAccessToken(UUID userId, String email, String role) {
        long expiryMs = appConfig.jwt().accessExpirySeconds() * 1000L;
        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .claim("role", role)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiryMs))
            .signWith(key())
            .compact();
    }

    public Claims validateAndExtract(String token) {
        return Jwts.parser()
            .verifyWith(key())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public long getAccessExpirySeconds() {
        return appConfig.jwt().accessExpirySeconds();
    }
}
