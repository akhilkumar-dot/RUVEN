package com.founderbridge.auth.api;

import com.founderbridge.auth.dto.*;
import com.founderbridge.auth.service.AuthService;
import com.founderbridge.shared.CookieUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Auth", description = "Authentication and session management")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a new account")
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req,
                                  HttpServletResponse response) {
        return authService.register(req, response);
    }

    @Operation(summary = "Login with email/userHandle + password")
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req,
                               HttpServletRequest request,
                               HttpServletResponse response) {
        String ua = request.getHeader("User-Agent");
        String ip = request.getRemoteAddr();
        return authService.login(req, response, ua, ip);
    }

    @Operation(summary = "Refresh access token using rotating refresh token cookie")
    @PostMapping("/refresh")
    public AuthResponse refresh(
            @CookieValue(name = "rt", required = false) String refreshToken,
            HttpServletRequest request,
            HttpServletResponse response) {
        return authService.refresh(refreshToken, response,
            request.getHeader("User-Agent"), request.getRemoteAddr());
    }

    @Operation(summary = "Logout and revoke current session")
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@CookieValue(name = "rt", required = false) String refreshToken,
                       HttpServletResponse response) {
        authService.logout(refreshToken, response);
    }

    @Operation(summary = "Logout all devices")
    @PostMapping("/logout-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logoutAll(@AuthenticationPrincipal String userId,
                          HttpServletResponse response) {
        authService.logoutAll(UUID.fromString(userId), response);
    }

    @Operation(summary = "Request password reset email")
    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.OK)
    public void forgotPassword(@RequestBody @Valid ForgotPasswordRequest req) {
        authService.forgotPassword(req.email());
        // Always 200 — see AuthService for why
    }

    @Operation(summary = "Reset password with one-time token")
    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@RequestBody @Valid ResetPasswordRequest req) {
        authService.resetPassword(req.token(), req.newPassword());
    }

    @Operation(summary = "Verify email address")
    @GetMapping("/verify-email")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
    }
}
