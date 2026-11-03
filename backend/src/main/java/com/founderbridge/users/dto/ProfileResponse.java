package com.founderbridge.users.dto;

import java.util.List;
import java.util.UUID;

public record ProfileResponse(
    String userId,
    String userHandle,
    String name,
    String type,
    String headline,
    String bio,
    String location,
    String education,
    String experience,
    String interests,
    String lookingFor,
    String links,
    String themeId,
    String publicSlug,
    String photoUrl,
    List<String> skills,
    InvestorData investor
) {
    public record InvestorData(
        String firm, String ticketSize, String thesis,
        List<String> sectors, List<String> stages, List<String> portfolio
    ) {}
}
