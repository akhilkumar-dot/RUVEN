package com.founderbridge.auth.dto;

public record AuthResponse(
    String accessToken,
    long expiresInSeconds,
    UserInfo user
) {
    public record UserInfo(String id, String userHandle, String email, String type) {}
}
