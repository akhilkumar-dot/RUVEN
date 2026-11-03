package com.founderbridge.auth.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
    @NotBlank @Size(min = 2, max = 100) String name,
    @NotBlank @Email String email,
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Must be a valid Indian mobile number")
    String phone,
    @NotBlank @Size(min = 8, max = 128) String password,
    @NotNull AccountType type
) {
    public enum AccountType {
        INDIVIDUAL, INVESTOR, STARTUP_FOUNDER, COMPANY_OWNER
    }
}
