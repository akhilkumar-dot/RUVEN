package com.founderbridge.media.api;

import com.founderbridge.auth.domain.UserRepository;
import com.founderbridge.media.service.StorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@Tag(name = "Media", description = "Presigned upload flow")
@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
public class MediaController {
    private final StorageService storageService;
    private final UserRepository userRepository;

    public record PresignRequest(
        @NotBlank String purpose,
        @NotBlank String contentType
    ) {}

    public record PresignResponse(String uploadUrl, UUID mediaId, String bucketKey) {}
    public record ConfirmRequest(Long sizeBytes) {}

    @PostMapping("/presign")
    public PresignResponse presign(@AuthenticationPrincipal String userId,
                                    @RequestBody PresignRequest req) {
        var user = userRepository.findById(UUID.fromString(userId)).orElseThrow();
        var result = storageService.presign(user, req.purpose(), req.contentType());
        return new PresignResponse(result.uploadUrl(), result.mediaId(), result.bucketKey());
    }

    @PostMapping("/{mediaId}/confirm")
    public ResponseEntity<Void> confirm(@AuthenticationPrincipal String userId,
                                         @PathVariable UUID mediaId,
                                         @RequestBody ConfirmRequest req) {
        storageService.confirm(mediaId, UUID.fromString(userId), req.sizeBytes());
        return ResponseEntity.noContent().build();
    }
}
