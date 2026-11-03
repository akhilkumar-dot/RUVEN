package com.founderbridge.users.dto;

import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record ProfileUpdateRequest(
    @Size(max = 200) String headline,
    @Size(max = 2000) String bio,
    @Size(max = 200) String location,
    String education,
    String experience,
    String interests,
    String lookingFor,
    String links,
    @Size(max = 50) String themeId,
    UUID photoMediaId,
    List<String> skills
) {}
