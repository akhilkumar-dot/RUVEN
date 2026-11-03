package com.founderbridge.companies.dto;
import jakarta.validation.constraints.*;
import java.util.UUID;

public record CompanyRequest(
    @NotBlank @Size(max=200) String name,
    @Size(max=100) String tagline,
    String description,
    @Size(max=100) String industry,
    Integer foundedYear,
    @Size(max=200) String location,
    @Size(max=500) String website,
    @Size(max=500) String linkedin,
    @Size(max=50) String themeId,
    UUID logoMediaId,
    UUID bannerMediaId
) {}
