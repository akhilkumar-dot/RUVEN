package com.founderbridge.users.domain;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface InvestorProfileRepository extends JpaRepository<InvestorProfile, UUID> {
    Optional<InvestorProfile> findByUserId(UUID userId);
}
