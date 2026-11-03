package com.founderbridge.media.service;

import com.founderbridge.AppConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import java.net.URI;

@Configuration
@RequiredArgsConstructor
public class S3Config {
    private final AppConfig appConfig;

    @Bean
    public S3Client s3Client() {
        var creds = AwsBasicCredentials.create(
            appConfig.storage().accessKey(),
            appConfig.storage().secretKey());
        return S3Client.builder()
            .endpointOverride(URI.create(appConfig.storage().endpoint()))
            .region(Region.of(appConfig.storage().region()))
            .credentialsProvider(StaticCredentialsProvider.create(creds))
            .forcePathStyle(true) // required for MinIO
            .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        var creds = AwsBasicCredentials.create(
            appConfig.storage().accessKey(),
            appConfig.storage().secretKey());
        return S3Presigner.builder()
            .endpointOverride(URI.create(appConfig.storage().endpoint()))
            .region(Region.of(appConfig.storage().region()))
            .credentialsProvider(StaticCredentialsProvider.create(creds))
            .build();
    }
}
