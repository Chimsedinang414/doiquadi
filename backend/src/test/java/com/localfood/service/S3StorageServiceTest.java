package com.localfood.service;

import com.localfood.config.StorageProperties;
import com.localfood.dto.StorageDtos;
import com.localfood.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.net.URI;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class S3StorageServiceTest {
    @Test
    void usesVirtualHostedStyleForAwsS3EvenWhenPathStyleIsConfigured() {
        StorageProperties properties = new StorageProperties();
        properties.setEnabled(true);
        properties.setEndpoint("");
        properties.setRegion("ap-southeast-2");
        properties.setBucket("localfood-test-bucket ");
        properties.setAccessKey("test-access-key");
        properties.setSecretKey("test-secret-key");
        properties.setPublicBaseUrl(
                "https://localfood-test-bucket.s3.ap-southeast-2.amazonaws.com");
        properties.setPathStyleAccess(true);

        UserRepository users = mock(UserRepository.class);
        when(users.existsById("test-user")).thenReturn(true);

        S3StorageService service = new S3StorageService(properties, users);
        try {
            StorageDtos.PresignUploadResponse response = service.createPresignedUpload(
                    new StorageDtos.PresignUploadRequest(
                            "test-user", "image.png", "image/png", 1));

            assertEquals(
                    "localfood-test-bucket.s3.ap-southeast-2.amazonaws.com",
                    URI.create(response.uploadUrl()).getHost());
        } finally {
            service.closeClients();
        }
    }
}
