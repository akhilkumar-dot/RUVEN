package com.founderbridge.social.domain;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, UUID> {
    boolean existsByPostIdAndUserId(UUID postId, UUID userId);
    Optional<PostLike> findByPostIdAndUserId(UUID postId, UUID userId);
}
