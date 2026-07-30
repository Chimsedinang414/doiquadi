package com.localfood.service;

import com.localfood.config.StorageProperties;
import com.localfood.dto.StorageDtos;
import com.localfood.exception.AppException;
import com.localfood.repository.UserRepository;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class S3StorageService implements StorageService {
    private static final Map<String, String> IMAGE_EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif");
    private static final Set<String> ALLOWED_IMAGE_TYPES = IMAGE_EXTENSIONS.keySet();

    private final StorageProperties properties;
    private final UserRepository userRepository;
    private final String endpoint;
    private final String bucket;
    private final String publicBaseUrl;
    private final S3Client s3Client;
    private final S3Presigner presigner;

    public S3StorageService(StorageProperties properties, UserRepository userRepository) {
        this.properties = properties;
        this.userRepository = userRepository;
        this.endpoint = trimToEmpty(properties.getEndpoint());
        this.bucket = trimToEmpty(properties.getBucket());
        this.publicBaseUrl = trimToEmpty(properties.getPublicBaseUrl());

        if (!properties.isEnabled()) {
            this.s3Client = null;
            this.presigner = null;
            return;
        }

        validateConfiguration();
        StaticCredentialsProvider credentials = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(properties.getAccessKey(), properties.getSecretKey()));
        boolean usePathStyle = !endpoint.isBlank()
                && properties.isPathStyleAccess();
        S3Configuration s3Configuration = S3Configuration.builder()
                .pathStyleAccessEnabled(usePathStyle)
                .build();

        S3ClientBuilder clientBuilder = S3Client.builder()
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .region(Region.of(properties.getRegion()))
                .credentialsProvider(credentials)
                .serviceConfiguration(s3Configuration);
        S3Presigner.Builder presignerBuilder = S3Presigner.builder()
                .region(Region.of(properties.getRegion()))
                .credentialsProvider(credentials)
                .serviceConfiguration(s3Configuration);

        if (!endpoint.isBlank()) {
            URI endpointUri = URI.create(endpoint);
            clientBuilder.endpointOverride(endpointUri);
            presignerBuilder.endpointOverride(endpointUri);
        }

        this.s3Client = clientBuilder.build();
        this.presigner = presignerBuilder.build();
    }

    @Override
    public StorageDtos.PresignUploadResponse createPresignedUpload(
            StorageDtos.PresignUploadRequest request) {
        ensureEnabled();
        requireUser(request.userId());
        String contentType = normalizeContentType(request.contentType());
        validateImage(contentType, request.fileSize());

        String objectKey = objectPrefix(request.userId())
                + UUID.randomUUID() + IMAGE_EXTENSIONS.get(contentType);
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .contentType(contentType)
                .build();
        Duration duration = Duration.ofSeconds(properties.getPresignSeconds());
        PresignedPutObjectRequest presigned = presigner.presignPutObject(
                PutObjectPresignRequest.builder()
                        .signatureDuration(duration)
                        .putObjectRequest(putObjectRequest)
                        .build());

        return new StorageDtos.PresignUploadResponse(
                objectKey,
                presigned.url().toString(),
                publicUrl(objectKey),
                Instant.now().plus(duration),
                Map.of("Content-Type", contentType));
    }

    @Override
    public StorageDtos.CompleteUploadResponse confirmUpload(
            StorageDtos.CompleteUploadRequest request) {
        StoredObject object = requireUploadedImage(request.userId(), request.objectKey());
        return new StorageDtos.CompleteUploadResponse(
                object.objectKey(), object.publicUrl(), object.contentType(), object.fileSize());
    }

    @Override
    public StoredObject requireUploadedImage(String userId, String objectKey) {
        ensureEnabled();
        requireUser(userId);
        validateOwnership(userId, objectKey);
        try {
            HeadObjectResponse response = s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .build());
            String contentType = normalizeContentType(response.contentType());
            long fileSize = response.contentLength() == null ? 0 : response.contentLength();
            validateImage(contentType, fileSize);
            return new StoredObject(objectKey, publicUrl(objectKey), contentType, fileSize);
        } catch (S3Exception | SdkClientException exception) {
            throw new AppException("Không thể xác nhận ảnh đã tải lên");
        }
    }

    private void validateImage(String contentType, long fileSize) {
        if (!ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new AppException("Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF");
        }
        if (fileSize <= 0 || fileSize > properties.getMaxFileSize()) {
            throw new AppException("Ảnh phải nhỏ hơn "
                    + properties.getMaxFileSize() / (1024 * 1024) + "MB");
        }
    }

    private String normalizeContentType(String contentType) {
        if (contentType == null) {
            return "";
        }
        return contentType.split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
    }

    private void validateOwnership(String userId, String objectKey) {
        if (objectKey == null || !objectKey.startsWith(objectPrefix(userId))) {
            throw new AppException("Ảnh tải lên không thuộc người dùng hiện tại");
        }
    }

    private String objectPrefix(String userId) {
        return "users/" + userId + "/images/";
    }

    private String publicUrl(String objectKey) {
        return stripTrailingSlash(publicBaseUrl) + "/" + objectKey;
    }

    private String stripTrailingSlash(String value) {
        return value.replaceAll("/+$", "");
    }

    private void requireUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException("Không tìm thấy người dùng");
        }
    }

    private void ensureEnabled() {
        if (!properties.isEnabled()) {
            throw new AppException(
                    "Upload online chưa được cấu hình. Hãy bật STORAGE_ENABLED và cấu hình bucket R2/S3");
        }
    }

    private void validateConfiguration() {
        if (bucket.isBlank()
                || properties.getAccessKey().isBlank()
                || properties.getSecretKey().isBlank()
                || publicBaseUrl.isBlank()) {
            throw new IllegalStateException(
                    "Storage is enabled but bucket, credentials or public base URL is missing");
        }
        if (properties.getPresignSeconds() < 60 || properties.getPresignSeconds() > 3600) {
            throw new IllegalStateException("Storage presign duration must be between 60 and 3600 seconds");
        }
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    @PreDestroy
    public void closeClients() {
        if (s3Client != null) {
            s3Client.close();
        }
        if (presigner != null) {
            presigner.close();
        }
    }
}
