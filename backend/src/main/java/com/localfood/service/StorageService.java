package com.localfood.service;

import com.localfood.dto.StorageDtos;

public interface StorageService {
    StorageDtos.PresignUploadResponse createPresignedUpload(
            StorageDtos.PresignUploadRequest request);

    StorageDtos.CompleteUploadResponse confirmUpload(
            StorageDtos.CompleteUploadRequest request);

    StoredObject requireUploadedImage(String userId, String objectKey);

    record StoredObject(String objectKey, String publicUrl, String contentType, long fileSize) {
    }
}
