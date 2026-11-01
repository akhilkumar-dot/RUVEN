package com.founderbridge.auth.dto;

import jakarta.validation.constraints.*;

public record LoginRequest(
    @NotBlank(message = "Email or user handle is required")
    String emailOrHandle,

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be 8-128 characters")
    String password
) {}
