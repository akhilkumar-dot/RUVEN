package com.founderbridge.jobs.domain;

import com.founderbridge.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "applications",
    uniqueConstraints = @UniqueConstraint(columnNames = {"job_id","applicant_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false) private Job job;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "applicant_id", nullable = false) private User applicant;
    @Column(columnDefinition = "TEXT") private String coverNote;
    @Column(name = "resume_media_id") private UUID resumeMediaId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20) @Builder.Default
    private AppStatus status = AppStatus.APPLIED;
    @CreationTimestamp @Column(name = "applied_at", nullable = false, updatable = false)
    private OffsetDateTime appliedAt;

    public enum AppStatus { APPLIED, REVIEWING, SHORTLISTED, REJECTED, HIRED }
}
