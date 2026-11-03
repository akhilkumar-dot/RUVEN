package com.founderbridge.auth.service;

import com.founderbridge.AppConfig;
import com.founderbridge.auth.domain.*;
import com.founderbridge.shared.CookieUtil;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Handles Google OAuth2 callback — creates/updates the user, issues JWT,
 * and redirects to the frontend with the access token in the URL fragment
 * (frontend extracts it and stores in Zustand; the refresh token is in an HttpOnly cookie).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GoogleOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository     userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserHandleGenerator handleGenerator;
    private final JwtService          jwtService;
    private final CookieUtil          cookieUtil;
    private final AppConfig           appConfig;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String googleId = oauthUser.getAttribute("sub");
        String email    = oauthUser.getAttribute("email");
        String name     = oauthUser.getAttribute("name");
        String avatar   = oauthUser.getAttribute("picture");

        // ── Upsert user ─────────────────────────────────────────
        User user = userRepository.findByGoogleId(googleId).orElseGet(() ->
            userRepository.findByEmailIgnoreCase(email).orElse(null));

        if (user == null) {
            String handle = handleGenerator.generate(name != null ? name : email.split("@")[0]);
            user = User.builder()
                .userHandle(handle)
                .email(email.toLowerCase().strip())
                .googleId(googleId)
                .avatarUrl(avatar)
                .name(name)
                .type(User.AccountType.INDIVIDUAL)
                .role(User.Role.USER)
                .status(User.UserStatus.ACTIVE)
                .build();
        } else {
            // Merge Google ID if signed up via email first
            if (user.getGoogleId() == null) user.setGoogleId(googleId);
            if (avatar != null) user.setAvatarUrl(avatar);
        }
        user.setLastLoginAt(OffsetDateTime.now());
        user = userRepository.save(user);

        // ── Issue tokens ─────────────────────────────────────────
        String accessToken  = jwtService.generateAccessToken(user.getId(), email, user.getRole().name());
        String refreshToken = UUID.randomUUID().toString();
        String tokenHash    = AuthService.sha256(refreshToken);
        int expiryDays      = appConfig.jwt().refreshExpiryDays();

        refreshTokenRepository.deleteByUserIdAndRevokedAtIsNull(user.getId()); // single-session
        refreshTokenRepository.save(RefreshToken.builder()
            .user(user).tokenHash(tokenHash)
            .expiresAt(OffsetDateTime.now().plusDays(expiryDays))
            .userAgent(request.getHeader("User-Agent"))
            .ipAddress(request.getRemoteAddr())
            .build());

        cookieUtil.setRefreshCookie(response, refreshToken, expiryDays * 86400);

        // ── Redirect to frontend ─────────────────────────────────
        // Fragment is not sent to server — safe to carry short-lived token
        String frontendBase = request.getHeader("Origin") != null
            ? request.getHeader("Origin")
            : "http://localhost:3000";
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendBase + "/auth/callback")
            .queryParam("token", accessToken)
            .queryParam("handle", user.getUserHandle())
            .build().toUriString();

        log.info("Google OAuth success for {} ({})", user.getUserHandle(), email);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
