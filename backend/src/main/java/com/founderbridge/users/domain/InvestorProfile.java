package com.founderbridge.users.domain;

import com.founderbridge.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;
import java.util.*;

@Entity @Table(name = "investor_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvestorProfile {
    @Id private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 200) private String firm;
    @Column(name = "ticket_size", length = 100) private String ticketSize;
    @Column(columnDefinition = "TEXT") private String thesis;
    @Column(length = 500) private String site;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "investor_sectors", joinColumns = @JoinColumn(name = "investor_user_id"))
    @Column(name = "sector")
    @Builder.Default
    private List<String> sectors = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "investor_stages", joinColumns = @JoinColumn(name = "investor_user_id"))
    @Column(name = "stage")
    @Builder.Default
    private List<String> stages = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "investor_portfolio", joinColumns = @JoinColumn(name = "investor_user_id"))
    @Column(name = "company_name")
    @Builder.Default
    private List<String> portfolio = new ArrayList<>();

    @UpdateTimestamp @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
