package com.founderbridge.social.domain;

import com.founderbridge.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;
import java.util.*;

@Entity @Table(name = "posts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false) private User author;
    @Column(columnDefinition = "TEXT", nullable = false) private String body;
    @Column(name = "media_ids", columnDefinition = "TEXT") private String mediaIds; // JSON array
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20) @Builder.Default
    private PostVisibility visibility = PostVisibility.PUBLIC;
    @Column(name = "like_count", nullable = false) @Builder.Default private int likeCount = 0;
    @Column(name = "comment_count", nullable = false) @Builder.Default private int commentCount = 0;
    @Column(name = "deleted_at") private OffsetDateTime deletedAt;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;

    public enum PostVisibility { PUBLIC, CONNECTIONS, PRIVATE }
}
