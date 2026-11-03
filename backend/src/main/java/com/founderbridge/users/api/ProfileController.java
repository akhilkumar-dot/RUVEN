package com.founderbridge.users.api;

import com.founderbridge.users.dto.*;
import com.founderbridge.users.service.ProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@Tag(name = "Profiles")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/users/{handle}/profile")
    public ProfileResponse getPublic(@PathVariable String handle) {
        return profileService.getPublicProfile(handle);
    }

    @GetMapping("/me/profile")
    public ProfileResponse getMe(@AuthenticationPrincipal String userId) {
        return profileService.getMyProfile(UUID.fromString(userId));
    }

    @PatchMapping("/me/profile")
    public ProfileResponse updateProfile(@AuthenticationPrincipal String userId,
                                          @Valid @RequestBody ProfileUpdateRequest req) {
        return profileService.updateProfile(UUID.fromString(userId), req);
    }

    @PatchMapping("/me/investor-profile")
    public ProfileResponse updateInvestorProfile(@AuthenticationPrincipal String userId,
                                                  @Valid @RequestBody InvestorProfileUpdateRequest req) {
        return profileService.updateInvestorProfile(UUID.fromString(userId), req);
    }
}
