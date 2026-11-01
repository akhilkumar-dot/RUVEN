package com.founderbridge.auth.service;

import com.founderbridge.AppConfig;
import com.founderbridge.auth.domain.*;
import com.founderbridge.auth.dto.*;
import com.founderbridge.shared.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository          userRepository;
    private final RefreshTokenRepository  refreshTokenRepository;
    private final OneTimeTokenRepository  oneTimeTokenRepository;
    private final PasswordEncoder         passwordEncoder;
    private final JwtService              jwtService;
    private final UserHandleGenerator     handleGenerator;
    private final CookieUtil              cookieUtil;
    private final AppConfig               appConfig;
    // EmailService injected once email module is built (Phase 1 step 2)
    // private final EmailService emailService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // ── REGISTRATION ─────────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest req, HttpServletResponse response) {
        // Email uniqueness — generic error message (never reveal existence)
        if (userRepository.existsByEmailIgnoreCase(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "An account with this email already exists.");
        }

        String userHandle = handleGenerator.generate(req.name());
        String passwordHash = passwordEncoder.encode(req.password());

        User user = User.builder()
                .userHandle(userHandle)
                .email(req.email().toLowerCase().strip())
                .passwordHash(passwordHash)
                .type(User.AccountType.valueOf(req.type().name()))
                .build();

        userRepository.save(user);

        // Issue tokens
        String rawRefresh = issueRefreshToken(user, response, null, null);
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());

        // TODO: send email verification (emailService.sendVerification(user))

        log.info("User registered: {} ({})", userHandle, user.getEmail());
        return new AuthResponse(
            accessToken,
            jwtService.getAccessExpirySeconds(),
            new AuthResponse.UserInfo(user.getId().toString(), userHandle, user.getEmail(), user.getType().name())
        );
    }

    // ── LOGIN ─────────────────────────────────────────────────────

    @Transactional
    public AuthResponse login(LoginRequest req, HttpServletResponse response,
                               String userAgent, String ipAddress) {
        // Generic message — never reveal whether email/handle exists
        User user = userRepository.findByEmailOrHandle(req.emailOrHandle())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Incorrect email/User ID or password."));

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "This account has been suspended.");
        }

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "Incorrect email/User ID or password.");
        }

        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        issueRefreshToken(user, response, userAgent, ipAddress);

        log.info("User logged in: {}", user.getUserHandle());
        return new AuthResponse(
            accessToken,
            jwtService.getAccessExpirySeconds(),
            new AuthResponse.UserInfo(user.getId().toString(), user.getUserHandle(), user.getEmail(), user.getType().name())
        );
    }

    // ── REFRESH ───────────────────────────────────────────────────

    @Transactional
    public AuthResponse refresh(String rawToken, HttpServletResponse response,
                                 String userAgent, String ipAddress) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing refresh token.");
        }

        String hash = sha256(rawToken);
        RefreshToken rt = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token."));

        // Replay-attack detection: if token already revoked, revoke the entire family
        if (rt.isRevoked()) {
            refreshTokenRepository.revokeFamily(rt.getFamilyId(), OffsetDateTime.now());
            cookieUtil.clearRefreshCookie(response);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token reuse detected. Please log in again.");
        }

        if (rt.isExpired()) {
            cookieUtil.clearRefreshCookie(response);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expired. Please log in again.");
        }

        // Rotate: revoke old, issue new in same family
        rt.setRevokedAt(OffsetDateTime.now());
        refreshTokenRepository.save(rt);

        User user = rt.getUser();
        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        issueRefreshTokenInFamily(user, rt.getFamilyId(), response, userAgent, ipAddress);

        return new AuthResponse(
            newAccessToken,
            jwtService.getAccessExpirySeconds(),
            new AuthResponse.UserInfo(user.getId().toString(), user.getUserHandle(), user.getEmail(), user.getType().name())
        );
    }

    // ── LOGOUT ────────────────────────────────────────────────────

    @Transactional
    public void logout(String rawToken, HttpServletResponse response) {
        if (rawToken != null && !rawToken.isBlank()) {
            refreshTokenRepository.findByTokenHash(sha256(rawToken))
                    .ifPresent(rt -> {
                        rt.setRevokedAt(OffsetDateTime.now());
                        refreshTokenRepository.save(rt);
                    });
        }
        cookieUtil.clearRefreshCookie(response);
    }

    @Transactional
    public void logoutAll(UUID userId, HttpServletResponse response) {
        refreshTokenRepository.revokeAllForUser(userId, OffsetDateTime.now());
        cookieUtil.clearRefreshCookie(response);
    }

    // ── FORGOT / RESET PASSWORD ───────────────────────────────────

    @Transactional
    public void forgotPassword(String email) {
        // Always succeeds — never reveal whether email exists
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            oneTimeTokenRepository.deleteUnusedByUserAndPurpose(
                user.getId(), OneTimeToken.Purpose.PASSWORD_RESET);

            String rawToken = generateSecureToken();
            OneTimeToken ott = OneTimeToken.builder()
                    .user(user)
                    .purpose(OneTimeToken.Purpose.PASSWORD_RESET)
                    .tokenHash(sha256(rawToken))
                    .expiresAt(OffsetDateTime.now().plusMinutes(30))
                    .build();
            oneTimeTokenRepository.save(ott);
            // TODO: emailService.sendPasswordReset(user, rawToken);
            log.info("Password reset token issued for user: {}", user.getUserHandle());
        });
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        OneTimeToken ott = oneTimeTokenRepository.findByTokenHash(sha256(rawToken))
                .filter(t -> t.getPurpose() == OneTimeToken.Purpose.PASSWORD_RESET)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired token."));

        if (!ott.isValid()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token has expired or already been used.");
        }

        User user = ott.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used + invalidate all sessions
        ott.setUsedAt(OffsetDateTime.now());
        oneTimeTokenRepository.save(ott);
        refreshTokenRepository.revokeAllForUser(user.getId(), OffsetDateTime.now());

        log.info("Password reset for user: {}", user.getUserHandle());
    }

    // ── EMAIL VERIFICATION ────────────────────────────────────────

    @Transactional
    public void verifyEmail(String rawToken) {
        OneTimeToken ott = oneTimeTokenRepository.findByTokenHash(sha256(rawToken))
                .filter(t -> t.getPurpose() == OneTimeToken.Purpose.EMAIL_VERIFY)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification link."));

        if (!ott.isValid()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification link has expired.");
        }

        User user = ott.getUser();
        user.setEmailVerifiedAt(OffsetDateTime.now());
        userRepository.save(user);

        ott.setUsedAt(OffsetDateTime.now());
        oneTimeTokenRepository.save(ott);
        log.info("Email verified for user: {}", user.getUserHandle());
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────

    private String issueRefreshToken(User user, HttpServletResponse response,
                                      String userAgent, String ipAddress) {
        return issueRefreshTokenInFamily(user, UUID.randomUUID(), response, userAgent, ipAddress);
    }

    private String issueRefreshTokenInFamily(User user, UUID familyId,
                                              HttpServletResponse response,
                                              String userAgent, String ipAddress) {
        String rawToken = generateSecureToken();
        int expiryDays = appConfig.jwt().refreshExpiryDays();

        RefreshToken rt = RefreshToken.builder()
                .familyId(familyId)
                .user(user)
                .tokenHash(sha256(rawToken))
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .expiresAt(OffsetDateTime.now().plusDays(expiryDays))
                .build();
        refreshTokenRepository.save(rt);

        cookieUtil.setRefreshCookie(response, rawToken, expiryDays * 86400);
        return rawToken;
    }

    private static String generateSecureToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
