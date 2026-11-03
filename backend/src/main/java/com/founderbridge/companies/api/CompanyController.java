package com.founderbridge.companies.api;

import com.founderbridge.companies.dto.*;
import com.founderbridge.companies.service.CompanyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@Tag(name = "Companies")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @PostMapping("/companies")
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyResponse create(@AuthenticationPrincipal String userId,
                                   @Valid @RequestBody CompanyRequest req) {
        return companyService.create(UUID.fromString(userId), req);
    }

    @GetMapping("/companies/{slug}/public")
    public CompanyResponse getPublic(@PathVariable String slug) {
        return companyService.getBySlug(slug);
    }

    @GetMapping("/me/companies")
    public List<CompanyResponse> myCompanies(@AuthenticationPrincipal String userId) {
        return companyService.myCompanies(UUID.fromString(userId));
    }

    @PatchMapping("/companies/{id}")
    public CompanyResponse update(@AuthenticationPrincipal String userId,
                                   @PathVariable UUID id,
                                   @Valid @RequestBody CompanyRequest req) {
        return companyService.update(UUID.fromString(userId), id, req);
    }

    @GetMapping("/companies")
    public Page<CompanyResponse> search(@RequestParam(required=false) String q,
                                         @RequestParam(defaultValue="0") int page) {
        return companyService.search(q, page);
    }
}
