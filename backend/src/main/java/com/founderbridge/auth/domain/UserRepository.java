package com.founderbridge.auth.domain;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUserHandleIgnoreCase(String userHandle);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUserHandleIgnoreCase(String userHandle);

    /** Login by either email OR user handle */
    @Query("""
        SELECT u FROM User u
        WHERE (lower(u.email) = lower(:value) OR lower(u.userHandle) = lower(:value))
          AND u.deletedAt IS NULL
        """)
    Optional<User> findByEmailOrHandle(String value);
}
