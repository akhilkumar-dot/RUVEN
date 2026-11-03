package com.founderbridge.media.service;

import com.founderbridge.AppConfig;
import com.founderbridge.auth.domain.User;
import com.founderbridge.media.domain.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.*;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {

    private final S3Presigner s3Presigner;
    private final MediaAssetRepository mediaAssetRepository;
    private final AppConfig appConfig;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/gif");
    private static final Set<String> ALLOWED_DOC_TYPES = Set.of(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    private static final long MAX_IMAGE_BYTES = 10 * 1024 * 1024L; // 10 MB
    private static final long MAX_DOC_BYTES   = 5  * 1024 * 1024L; // 5 MB

    public record PresignResult(String uploadUrl, UUID mediaId, String bucketKey) {}

    @Transactional
    public PresignResult presign(User owner, String purpose, String contentType) {
        validateContentType(purpose, contentType);

        String ext = contentType.contains("pdf") ? ".pdf"
            : contentType.contains("word") ? ".docx"
            : contentType.contains("png")  ? ".png"
            : contentType.contains("webp") ? ".webp"
            : contentType.contains("gif")  ? ".gif"
            : ".jpg";

        String key = purpose + "/" + owner.getId() + "/" + UUID.randomUUID() + ext;
        String bucket = appConfig.storage().bucket();

        var req = PutObjectRequest.builder()
            .bucket(bucket).key(key)
            .contentType(contentType)
            .contentLengthRange(1L, isImage(purpose) ? MAX_IMAGE_BYTES : MAX_DOC_BYTES)
            .build();
        var presignReq = PutObjectPresignRequest.builder()
            .putObjectRequest(req)
            .signatureDuration(Duration.ofMinutes(10))
            .build();
        String uploadUrl = s3Presigner.presignPutObject(presignReq).url().toString();

        MediaAsset asset = MediaAsset.builder()
            .owner(owner).bucketKey(key).mimeType(contentType).purpose(purpose)
            .build();
        mediaAssetRepository.save(asset);

        log.debug("Presigned upload for user={} purpose={} key={}", owner.getId(), purpose, key);
        return new PresignResult(uploadUrl, asset.getId(), key);
    }

    @Transactional
    public MediaAsset confirm(UUID mediaId, UUID ownerId, Long sizeBytes) {
        MediaAsset asset = mediaAssetRepository.findById(mediaId)
            .orElseThrow(() -> new IllegalArgumentException("Media not found"));
        if (!asset.getOwner().getId().equals(ownerId))
            throw new SecurityException("Not your media");
        asset.setStatus(MediaAsset.MediaStatus.READY);
        asset.setSizeBytes(sizeBytes);
        return mediaAssetRepository.save(asset);
    }

    /** Generate a signed GET URL valid for 1 hour */
    public String signedUrl(String bucketKey) {
        var req = GetObjectRequest.builder()
            .bucket(appConfig.storage().bucket()).key(bucketKey).build();
        var presignReq = GetObjectPresignRequest.builder()
            .getObjectRequest(req)
            .signatureDuration(Duration.ofHours(1))
            .build();
        return s3Presigner.presignGetObject(presignReq).url().toString();
    }

    private void validateContentType(String purpose, String contentType) {
        if (isImage(purpose) && !ALLOWED_IMAGE_TYPES.contains(contentType))
            throw new IllegalArgumentException("Only JPEG, PNG, WebP, and GIF images are allowed");
        if ("resume".equals(purpose) && !ALLOWED_DOC_TYPES.contains(contentType))
            throw new IllegalArgumentException("Only PDF and Word documents are allowed for resumes");
    }

    private boolean isImage(String purpose) {
        return !purpose.equals("resume");
    }
}
