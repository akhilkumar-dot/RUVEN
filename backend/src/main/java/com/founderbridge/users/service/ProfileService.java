package com.founderbridge.users.service;

import com.founderbridge.auth.domain.*;
import com.founderbridge.media.service.StorageService;
import com.founderbridge.users.domain.*;
import com.founderbridge.users.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.text.Normalizer;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository         profileRepository;
    private final InvestorProfileRepository investorProfileRepository;
    private final UserRepository            userRepository;
    private final StorageService            storageService;

    public ProfileResponse getPublicProfile(String userHandleOrSlug) {
        User user = userRepository.findByUserHandleIgnoreCase(userHandleOrSlug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return buildResponse(user);
    }

    public ProfileResponse getMyProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return buildResponse(user);
    }

    @Transactional
    public ProfileResponse updateProfile(UUID userId, ProfileUpdateRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        Profile profile = profileRepository.findByUserId(userId)
            .orElseGet(() -> Profile.builder().user(user).userId(userId).build());

        if (req.headline()     != null) profile.setHeadline(req.headline());
        if (req.bio()          != null) profile.setBio(req.bio());
        if (req.location()     != null) profile.setLocation(req.location());
        if (req.education()    != null) profile.setEducation(req.education());
        if (req.experience()   != null) profile.setExperience(req.experience());
        if (req.interests()    != null) profile.setInterests(req.interests());
        if (req.lookingFor()   != null) profile.setLookingFor(req.lookingFor());
        if (req.links()        != null) profile.setLinks(req.links());
        if (req.themeId()      != null) profile.setThemeId(req.themeId());
        if (req.photoMediaId() != null) profile.setPhotoMediaId(req.photoMediaId());
        if (req.skills()       != null) {
            profile.getSkills().clear();
            profile.getSkills().addAll(req.skills());
        }

        // Auto-generate public slug from userHandle if not set
        if (profile.getPublicSlug() == null) {
            profile.setPublicSlug(slugify(user.getUserHandle()));
        }

        profileRepository.save(profile);
        return buildResponse(user);
    }

    @Transactional
    public ProfileResponse updateInvestorProfile(UUID userId, InvestorProfileUpdateRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        InvestorProfile ip = investorProfileRepository.findByUserId(userId)
            .orElseGet(() -> InvestorProfile.builder().user(user).userId(userId).build());

        if (req.firm()       != null) ip.setFirm(req.firm());
        if (req.ticketSize() != null) ip.setTicketSize(req.ticketSize());
        if (req.thesis()     != null) ip.setThesis(req.thesis());
        if (req.site()       != null) ip.setSite(req.site());
        if (req.sectors()    != null) { ip.getSectors().clear(); ip.getSectors().addAll(req.sectors()); }
        if (req.stages()     != null) { ip.getStages().clear();  ip.getStages().addAll(req.stages()); }
        if (req.portfolio()  != null) { ip.getPortfolio().clear(); ip.getPortfolio().addAll(req.portfolio()); }

        investorProfileRepository.save(ip);
        return buildResponse(user);
    }

    // ── Private helpers ─────────────────────────────────────────

    private ProfileResponse buildResponse(User user) {
        Profile p = profileRepository.findByUserId(user.getId()).orElse(null);
        InvestorProfile ip = investorProfileRepository.findByUserId(user.getId()).orElse(null);

        String photoUrl = null;
        if (p != null && p.getPhotoMediaId() != null) {
            // Generate signed URL — in production a CDN prefix would replace this
            photoUrl = "/api/v1/media/" + p.getPhotoMediaId() + "/url";
        }

        ProfileResponse.InvestorData investorData = null;
        if (ip != null) {
            investorData = new ProfileResponse.InvestorData(
                ip.getFirm(), ip.getTicketSize(), ip.getThesis(),
                ip.getSectors(), ip.getStages(), ip.getPortfolio());
        }

        return new ProfileResponse(
            user.getId().toString(),
            user.getUserHandle(),
            null, // name comes from profile headline or handle
            user.getType().name(),
            p != null ? p.getHeadline()   : null,
            p != null ? p.getBio()        : null,
            p != null ? p.getLocation()   : null,
            p != null ? p.getEducation()  : null,
            p != null ? p.getExperience() : null,
            p != null ? p.getInterests()  : null,
            p != null ? p.getLookingFor() : null,
            p != null ? p.getLinks()      : null,
            p != null ? p.getThemeId()    : "noir",
            p != null ? p.getPublicSlug() : user.getUserHandle(),
            photoUrl,
            p != null ? p.getSkills()     : List.of(),
            investorData
        );
    }

    private String slugify(String input) {
        return Normalizer.normalize(input, Normalizer.Form.NFD)
            .replaceAll("[^\\p{ASCII}]", "")
            .toLowerCase()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("^-|-$", "");
    }
}
