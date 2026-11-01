package com.founderbridge.auth.api;

import com.founderbridge.auth.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "Authentication and session management")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    // AuthService injected in Phase 1 when full business logic is wired
    // private final AuthService authService;

    @Operation(summary = "Register a new account")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest req,
            jakarta.servlet.http.HttpServletResponse response) {
        // Phase 1 implementation
        throw new UnsupportedOperationException("Phase 1 — auth service not wired yet");
    }

    @Operation(summary = "Login with email/userHandle + password")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest req,
            jakarta.servlet.http.HttpServletResponse response) {
        // Phase 1 implementation
        throw new UnsupportedOperationException("Phase 1 — auth service not wired yet");
    }

    @Operation(summary = "Refresh access token using rotating refresh token cookie")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = "rt", required = false) String refreshToken,
            jakarta.servlet.http.HttpServletResponse response) {
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // Phase 1 implementation
        throw new UnsupportedOperationException("Phase 1 — auth service not wired yet");
    }

    @Operation(summary = "Logout and revoke refresh token")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "rt", required = false) String refreshToken,
            jakarta.servlet.http.HttpServletResponse response) {
        // Clear the cookie immediately
        var cookie = new jakarta.servlet.http.Cookie("rt", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Request password reset email")
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequest req) {
        // Always 200 — never reveal whether email exists
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Reset password with one-time token")
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @RequestBody @Valid ResetPasswordRequest req) {
        throw new UnsupportedOperationException("Phase 1 — not wired yet");
    }

    @Operation(summary = "Verify email address with one-time token")
    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        throw new UnsupportedOperationException("Phase 1 — not wired yet");
    }
}
