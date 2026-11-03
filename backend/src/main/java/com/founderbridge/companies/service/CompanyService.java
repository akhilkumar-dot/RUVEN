package com.founderbridge.companies.service;

import com.founderbridge.auth.domain.*;
import com.founderbridge.companies.domain.*;
import com.founderbridge.companies.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.text.Normalizer;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Transactional
    public CompanyResponse create(UUID ownerId, CompanyRequest req) {
        User owner = userRepository.findById(ownerId).orElseThrow();
        String slug = uniqueSlug(req.name());
        Company c = Company.builder()
            .owner(owner).name(req.name()).slug(slug)
            .tagline(req.tagline()).description(req.description())
            .industry(req.industry()).foundedYear(req.foundedYear())
            .location(req.location()).website(req.website()).linkedin(req.linkedin())
            .build();
        return toDto(companyRepository.save(c));
    }

    public CompanyResponse getBySlug(String slug) {
        return toDto(companyRepository.findBySlug(slug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    public List<CompanyResponse> myCompanies(UUID ownerId) {
        return companyRepository.findByOwnerId(ownerId).stream().map(this::toDto).toList();
    }

    @Transactional
    public CompanyResponse update(UUID ownerId, UUID companyId, CompanyRequest req) {
        Company c = companyRepository.findById(companyId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!c.getOwner().getId().equals(ownerId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        if (req.name()        != null) c.setName(req.name());
        if (req.tagline()     != null) c.setTagline(req.tagline());
        if (req.description() != null) c.setDescription(req.description());
        if (req.industry()    != null) c.setIndustry(req.industry());
        if (req.foundedYear() != null) c.setFoundedYear(req.foundedYear());
        if (req.location()    != null) c.setLocation(req.location());
        if (req.website()     != null) c.setWebsite(req.website());
        if (req.linkedin()    != null) c.setLinkedin(req.linkedin());
        if (req.themeId()     != null) c.setThemeId(req.themeId());
        if (req.logoMediaId() != null) c.setLogoMediaId(req.logoMediaId());
        return toDto(companyRepository.save(c));
    }

    public Page<CompanyResponse> search(String q, int page) {
        return companyRepository.findByStatusAndNameContainingIgnoreCase(
            Company.CompanyStatus.ACTIVE, q == null ? "" : q,
            PageRequest.of(page, 20, Sort.by("createdAt").descending()))
            .map(this::toDto);
    }

    private CompanyResponse toDto(Company c) {
        return new CompanyResponse(
            c.getId(), c.getName(), c.getSlug(), c.getTagline(),
            c.getDescription(), c.getIndustry(), c.getFoundedYear(),
            c.getLocation(), c.getWebsite(), c.getLinkedin(),
            c.getThemeId(), c.isVerified(), c.getCreatedAt().toString());
    }

    private String uniqueSlug(String name) {
        String base = Normalizer.normalize(name, Normalizer.Form.NFD)
            .replaceAll("[^\\p{ASCII}]","").toLowerCase()
            .replaceAll("[^a-z0-9]+","-").replaceAll("^-|-$","");
        String slug = base;
        int n = 2;
        while (companyRepository.existsBySlug(slug)) slug = base + "-" + n++;
        return slug;
    }
}
