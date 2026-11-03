package com.founderbridge.auth.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;

    @Column(name = "user_handle", length = 30, unique = true, nullable = false)
    private String userHandle;

    @Column(length = 255, unique = true, nullable = false) private String email;
    @Column(name = "password_hash", length = 255)         private String passwordHash;
    @Column(length = 15)                                   private String phone;
    @Column(length = 100)                                  private String name;
    @Column(name = "google_id", length = 255, unique = true) private String googleId;
    @Column(name = "avatar_url", columnDefinition = "TEXT") private String avatarUrl;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    @Builder.Default private Role role = Role.USER;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30)
    @Builder.Default private AccountType type = AccountType.INDIVIDUAL;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    @Builder.Default private UserStatus status = UserStatus.ACTIVE;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "last_login_at") private OffsetDateTime lastLoginAt;

    public enum Role         { USER, ADMIN, MODERATOR }
    public enum AccountType  { INDIVIDUAL, INVESTOR, STARTUP_FOUNDER, COMPANY_OWNER }
    public enum UserStatus   { ACTIVE, SUSPENDED, DELETED }
}
