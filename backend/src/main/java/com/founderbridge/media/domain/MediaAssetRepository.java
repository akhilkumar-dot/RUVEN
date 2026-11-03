package com.founderbridge.media.domain;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface MediaAssetRepository extends JpaRepository<MediaAsset, UUID> {
    List<MediaAsset> findByOwnerIdAndStatus(UUID ownerId, MediaAsset.MediaStatus status);
}
