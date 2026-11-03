package com.founderbridge.jobs.domain;

import com.founderbridge.companies.domain.Company;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Job {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 200) private String title;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(length = 100) private String location;
    @Column(name = "is_remote", nullable = false) @Builder.Default private boolean remote = false;
    @Column(name = "salary_range", length = 100) private String salaryRange;
    @Column(length = 50) private String type; // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
    @Column(length = 100) private String experience;
    @Column(length = 50) private String equity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20) @Builder.Default
    private JobStatus status = JobStatus.OPEN;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public enum JobStatus { OPEN, CLOSED, DRAFT }
}
