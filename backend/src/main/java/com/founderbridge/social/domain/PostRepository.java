package com.founderbridge.social.domain;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    Page<Post> findByAuthorIdAndDeletedAtIsNull(UUID authorId, Pageable pageable);

    @Query("""
        SELECT p FROM Post p
        WHERE p.deletedAt IS NULL
          AND p.visibility = 'PUBLIC'
          AND p.author.id IN :authorIds
        ORDER BY p.createdAt DESC
        """)
    Page<Post> findFeedPosts(List<UUID> authorIds, Pageable pageable);

    @Query("""
        SELECT p FROM Post p
        WHERE p.deletedAt IS NULL
          AND p.visibility = 'PUBLIC'
        ORDER BY p.createdAt DESC
        """)
    Page<Post> findPublicFeed(Pageable pageable);
}
