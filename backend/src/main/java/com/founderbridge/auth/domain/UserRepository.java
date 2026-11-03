package com.founderbridge.auth.domain;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByEmailIgnoreCase(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByUserHandle(String handle);
    Optional<User> findByGoogleId(String googleId);

    @Query("SELECT u FROM User u WHERE lower(u.email) = lower(:identifier) OR u.userHandle = :identifier")
    Optional<User> findByEmailOrHandle(String identifier);
}
