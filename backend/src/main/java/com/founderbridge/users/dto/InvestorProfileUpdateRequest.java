package com.founderbridge.users.dto;

import java.util.List;

public record InvestorProfileUpdateRequest(
    String firm,
    String ticketSize,
    String thesis,
    String site,
    List<String> sectors,
    List<String> stages,
    List<String> portfolio
) {}
