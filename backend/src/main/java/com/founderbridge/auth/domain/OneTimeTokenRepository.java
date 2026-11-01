package com.founderbridge.auth.domain;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.time.OffsetDateTime;
import java.util.*;

@Repository
public interface OneTimeTokenRepository extends JpaRepository<OneTimeToken, UUID> {

    Optional<OneTimeToken> findByTokenHash(String tokenHash);

    /** Delete all unused tokens of a given purpose for a user (before issuing a new one) */
    @Modifying
    @Query("""
        DELETE FROM OneTimeToken t
        WHERE t.user.id = :userId AND t.purpose = :purpose AND t.usedAt IS NULL
        """)
    void deleteUnusedByUserAndPurpose(UUID userId, OneTimeToken.Purpose purpose);

    /** Purge expired tokens */
    @Modifying
    @Query("DELETE FROM OneTimeToken t WHERE t.expiresAt < :before")
    void deleteExpiredBefore(OffsetDateTime before);
}
