package com.localfood.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Map;

public final class StorageDtos {
    private StorageDtos() {
    }

    public record PresignUploadRequest(
            @NotBlank String userId,
            @NotBlank @Size(max = 255) String fileName,
            @NotBlank @Size(max = 100) String contentType,
            @Positive long fileSize) {
    }

    public record PresignUploadResponse(
            String objectKey,
            String uploadUrl,
            String publicUrl,
            Instant expiresAt,
            Map<String, String> requiredHeaders) {
    }

    public record CompleteUploadRequest(
            @NotBlank String userId,
            @NotBlank @Size(max = 1024) String objectKey) {
    }

    public record CompleteUploadResponse(
            String objectKey,
            String publicUrl,
            String contentType,
            long fileSize) {
    }
}
