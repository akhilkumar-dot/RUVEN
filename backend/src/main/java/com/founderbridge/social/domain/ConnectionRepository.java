package com.founderbridge.social.domain;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, UUID> {
    @Query("""
        SELECT c FROM Connection c
        WHERE (c.requester.id = :a AND c.addressee.id = :b)
           OR (c.requester.id = :b AND c.addressee.id = :a)
        """)
    Optional<Connection> findBetween(UUID a, UUID b);

    @Query("""
        SELECT c FROM Connection c
        WHERE (c.requester.id = :userId OR c.addressee.id = :userId)
          AND c.status = 'ACCEPTED'
        """)
    List<Connection> findAcceptedFor(UUID userId);

    @Query("""
        SELECT c FROM Connection c
        WHERE c.addressee.id = :userId AND c.status = 'PENDING'
        """)
    List<Connection> findPendingFor(UUID userId);

    long countByAddresseeIdAndStatus(UUID addresseeId, Connection.ConnStatus status);
}
