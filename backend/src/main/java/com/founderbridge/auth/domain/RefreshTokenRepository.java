package com.founderbridge.auth.domain;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.time.OffsetDateTime;
import java.util.*;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findAllByFamilyId(UUID familyId);

    /** Revoke all active tokens in a family (replay-attack defence) */
    @Modifying
    @Query("""
        UPDATE RefreshToken rt
        SET rt.revokedAt = :now
        WHERE rt.familyId = :familyId AND rt.revokedAt IS NULL
        """)
    void revokeFamily(UUID familyId, OffsetDateTime now);

    /** Revoke all tokens for a user (logout-all) */
    @Modifying
    @Query("""
        UPDATE RefreshToken rt
        SET rt.revokedAt = :now
        WHERE rt.user.id = :userId AND rt.revokedAt IS NULL
        """)
    void revokeAllForUser(UUID userId, OffsetDateTime now);

    /** Purge expired tokens older than given date */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :before")
    void deleteExpiredBefore(OffsetDateTime before);
}
