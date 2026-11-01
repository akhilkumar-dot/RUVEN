package com.founderbridge.shared;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    @Value("${app.cookie.domain:localhost}")
    private String cookieDomain;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    private boolean isProd() {
        return "prod".equalsIgnoreCase(activeProfile);
    }

    /** Set HttpOnly Secure SameSite=Lax refresh-token cookie */
    public void setRefreshCookie(HttpServletResponse response, String token, int maxAgeSeconds) {
        Cookie cookie = new Cookie("rt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(isProd());
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(maxAgeSeconds);
        // SameSite=Lax — not directly supported by javax Cookie, use header
        String header = String.format(
            "rt=%s; Max-Age=%d; Path=/api/v1/auth; HttpOnly%s; SameSite=Lax%s",
            token,
            maxAgeSeconds,
            isProd() ? "; Secure" : "",
            isProd() ? ("; Domain=" + cookieDomain) : ""
        );
        response.addHeader("Set-Cookie", header);
    }

    /** Clear the refresh token cookie */
    public void clearRefreshCookie(HttpServletResponse response) {
        setRefreshCookie(response, "", 0);
    }
}
