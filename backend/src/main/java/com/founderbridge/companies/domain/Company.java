package com.founderbridge.companies.domain;

import com.founderbridge.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;
import java.util.*;

@Entity @Table(name = "companies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Company {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(unique = true, length = 100)
    private String slug;

    @Column(length = 100)
    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String industry;

    @Column(name = "founded_year")
    private Integer foundedYear;

    @Column(length = 100)
    private String location;

    @Column(length = 500)
    private String website;

    @Column(length = 500)
    private String linkedin;

    @Column(name = "logo_media_id")
    private UUID logoMediaId;

    @Column(name = "banner_media_id")
    private UUID bannerMediaId;

    @Column(name = "theme_id", length = 50)
    @Builder.Default
    private String themeId = "classic";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CompanyStatus status = CompanyStatus.ACTIVE;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private boolean verified = false;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public enum CompanyStatus { ACTIVE, SUSPENDED, DELETED }
}
