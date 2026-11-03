package com.founderbridge.companies.dto;
import java.util.UUID;

public record CompanyResponse(
    UUID id, String name, String slug, String tagline,
    String description, String industry, Integer foundedYear,
    String location, String website, String linkedin,
    String themeId, boolean verified, String createdAt
) {}
