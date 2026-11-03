package com.founderbridge.users.domain;

import com.founderbridge.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;
import java.util.*;

@Entity @Table(name = "profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Profile {
    @Id
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 200) private String headline;
    @Column(columnDefinition = "TEXT") private String bio;
    @Column(length = 200) private String location;
    @Column(columnDefinition = "TEXT") private String education;
    @Column(columnDefinition = "TEXT") private String experience;
    @Column(columnDefinition = "TEXT") private String interests;
    @Column(name = "looking_for", columnDefinition = "TEXT") private String lookingFor;
    @Column(columnDefinition = "TEXT") private String links;
    @Column(name = "photo_media_id") private UUID photoMediaId;
    @Column(name = "theme_id", length = 50) private String themeId;
    @Column(name = "public_slug", unique = true, length = 100) private String publicSlug;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "profile_skills",
        joinColumns = @JoinColumn(name = "profile_user_id"))
    @Column(name = "skill")
    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @UpdateTimestamp @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
