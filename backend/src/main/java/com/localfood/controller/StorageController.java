package com.localfood.controller;

import com.localfood.dto.StorageDtos;
import com.localfood.service.StorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
public class StorageController {
    private final StorageService storageService;

    @PostMapping("/presign")
    public StorageDtos.PresignUploadResponse presign(
            @Valid @RequestBody StorageDtos.PresignUploadRequest request) {
        return storageService.createPresignedUpload(request);
    }

    @PostMapping("/complete")
    public StorageDtos.CompleteUploadResponse complete(
            @Valid @RequestBody StorageDtos.CompleteUploadRequest request) {
        return storageService.confirmUpload(request);
    }
}
