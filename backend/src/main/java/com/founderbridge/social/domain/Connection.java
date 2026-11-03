package com.founderbridge.social.domain;

import com.founderbridge.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "connections",
    uniqueConstraints = @UniqueConstraint(columnNames = {"requester_id","addressee_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Connection {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id") private User requester;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "addressee_id") private User addressee;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20) @Builder.Default
    private ConnStatus status = ConnStatus.PENDING;
    @Column(name = "note", length = 500) private String note;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    @Column(name = "responded_at") private OffsetDateTime respondedAt;

    public enum ConnStatus { PENDING, ACCEPTED, DECLINED, BLOCKED }
}
