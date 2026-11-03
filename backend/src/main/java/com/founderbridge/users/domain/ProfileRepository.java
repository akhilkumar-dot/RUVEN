package com.founderbridge.users.domain;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    Optional<Profile> findByPublicSlug(String slug);
    Optional<Profile> findByUserId(UUID userId);
}
