package com.founderbridge.social.api;

import com.founderbridge.social.domain.*;
import com.founderbridge.social.service.SocialService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.*;

@Tag(name = "Social")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SocialController {
    private final SocialService socialService;

    // ── Feed ────────────────────────────────────────────────────

    @GetMapping("/feed")
    public Page<PostDto> getFeed(@AuthenticationPrincipal String userId,
                                  @RequestParam(defaultValue="0") int page) {
        return socialService.getFeed(UUID.fromString(userId), page).map(PostDto::from);
    }

    @GetMapping("/feed/public")
    public Page<PostDto> getPublicFeed(@RequestParam(defaultValue="0") int page) {
        return socialService.getPublicFeed(page).map(PostDto::from);
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public PostDto createPost(@AuthenticationPrincipal String userId,
                               @RequestBody CreatePostRequest req) {
        Post p = socialService.createPost(UUID.fromString(userId), req.body(),
            req.visibility() == null ? Post.PostVisibility.PUBLIC
                : Post.PostVisibility.valueOf(req.visibility()));
        return PostDto.from(p);
    }

    @PostMapping("/posts/{id}/like")
    public Map<String, Object> toggleLike(@AuthenticationPrincipal String userId,
                                           @PathVariable UUID id) {
        boolean liked = socialService.toggleLike(UUID.fromString(userId), id);
        return Map.of("liked", liked);
    }

    @DeleteMapping("/posts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(@AuthenticationPrincipal String userId, @PathVariable UUID id) {
        socialService.deletePost(UUID.fromString(userId), id);
    }

    // ── Connections ─────────────────────────────────────────────

    @PostMapping("/connections")
    @ResponseStatus(HttpStatus.CREATED)
    public ConnectionDto sendRequest(@AuthenticationPrincipal String userId,
                                      @RequestBody ConnectRequest req) {
        return ConnectionDto.from(socialService.sendRequest(
            UUID.fromString(userId), req.addresseeId(), req.note()));
    }

    @PatchMapping("/connections/{id}")
    public ConnectionDto respond(@AuthenticationPrincipal String userId,
                                  @PathVariable UUID id,
                                  @RequestBody RespondRequest req) {
        return ConnectionDto.from(socialService.respond(UUID.fromString(userId), id, req.accept()));
    }

    @GetMapping("/connections")
    public List<ConnectionDto> myConnections(@AuthenticationPrincipal String userId) {
        return socialService.myConnections(UUID.fromString(userId))
            .stream().map(ConnectionDto::from).toList();
    }

    @GetMapping("/connections/pending")
    public List<ConnectionDto> pending(@AuthenticationPrincipal String userId) {
        return socialService.pendingRequests(UUID.fromString(userId))
            .stream().map(ConnectionDto::from).toList();
    }

    // ── DTOs ────────────────────────────────────────────────────

    public record PostDto(UUID id, String authorId, String authorHandle, String body,
                           String visibility, int likeCount, int commentCount, String createdAt) {
        public static PostDto from(Post p) {
            return new PostDto(p.getId(), p.getAuthor().getId().toString(),
                p.getAuthor().getUserHandle(), p.getBody(),
                p.getVisibility().name(), p.getLikeCount(), p.getCommentCount(),
                p.getCreatedAt().toString());
        }
    }

    public record ConnectionDto(UUID id, String requesterId, String addresseeId,
                                 String requesterHandle, String addresseeHandle,
                                 String status, String createdAt) {
        public static ConnectionDto from(Connection c) {
            return new ConnectionDto(c.getId(),
                c.getRequester().getId().toString(), c.getAddressee().getId().toString(),
                c.getRequester().getUserHandle(), c.getAddressee().getUserHandle(),
                c.getStatus().name(), c.getCreatedAt().toString());
        }
    }

    public record CreatePostRequest(
        @NotBlank @Size(max=2000) String body, String visibility) {}
    public record ConnectRequest(UUID addresseeId, String note) {}
    public record RespondRequest(boolean accept) {}
}
