package com.founderbridge.social.service;

import com.founderbridge.auth.domain.*;
import com.founderbridge.social.domain.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SocialService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;

    // ── Posts ─────────────────────────────────────────────────

    @Transactional
    public Post createPost(UUID authorId, String body, Post.PostVisibility visibility) {
        User author = userRepository.findById(authorId).orElseThrow();
        Post post = Post.builder().author(author).body(body).visibility(visibility).build();
        return postRepository.save(post);
    }

    public Page<Post> getFeed(UUID userId, int page) {
        // Accepted connections + self
        List<UUID> connectedIds = connectionRepository.findAcceptedFor(userId)
            .stream().map(c ->
                c.getRequester().getId().equals(userId)
                    ? c.getAddressee().getId()
                    : c.getRequester().getId())
            .toList();
        List<UUID> feedIds = new ArrayList<>(connectedIds);
        feedIds.add(userId);
        if (feedIds.isEmpty()) return postRepository.findPublicFeed(PageRequest.of(page, 20));
        return postRepository.findFeedPosts(feedIds, PageRequest.of(page, 20));
    }

    public Page<Post> getPublicFeed(int page) {
        return postRepository.findPublicFeed(PageRequest.of(page, 20));
    }

    @Transactional
    public boolean toggleLike(UUID userId, UUID postId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Optional<PostLike> existing = postLikeRepository.findByPostIdAndUserId(postId, userId);
        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            postRepository.save(post);
            return false; // unliked
        } else {
            User user = userRepository.findById(userId).orElseThrow();
            postLikeRepository.save(PostLike.builder().post(post).user(user).build());
            post.setLikeCount(post.getLikeCount() + 1);
            postRepository.save(post);
            return true; // liked
        }
    }

    @Transactional
    public void deletePost(UUID userId, UUID postId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!post.getAuthor().getId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        post.setDeletedAt(OffsetDateTime.now());
        postRepository.save(post);
    }

    // ── Connections ──────────────────────────────────────────

    @Transactional
    public Connection sendRequest(UUID requesterId, UUID addresseeId, String note) {
        if (requesterId.equals(addresseeId))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot connect with yourself.");
        connectionRepository.findBetween(requesterId, addresseeId).ifPresent(c -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Connection already exists.");
        });
        User requester = userRepository.findById(requesterId).orElseThrow();
        User addressee = userRepository.findById(addresseeId).orElseThrow();
        return connectionRepository.save(
            Connection.builder().requester(requester).addressee(addressee).note(note).build());
    }

    @Transactional
    public Connection respond(UUID userId, UUID connectionId, boolean accept) {
        Connection conn = connectionRepository.findById(connectionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!conn.getAddressee().getId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        if (conn.getStatus() != Connection.ConnStatus.PENDING)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already responded.");
        conn.setStatus(accept ? Connection.ConnStatus.ACCEPTED : Connection.ConnStatus.DECLINED);
        conn.setRespondedAt(OffsetDateTime.now());
        return connectionRepository.save(conn);
    }

    public List<Connection> myConnections(UUID userId) {
        return connectionRepository.findAcceptedFor(userId);
    }

    public List<Connection> pendingRequests(UUID userId) {
        return connectionRepository.findPendingFor(userId);
    }
}
