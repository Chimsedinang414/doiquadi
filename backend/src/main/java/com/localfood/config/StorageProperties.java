package com.localfood.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {
    private boolean enabled;
    private String endpoint = "";
    private String region = "auto";
    private String bucket = "";
    private String accessKey = "";
    private String secretKey = "";
    private String publicBaseUrl = "";
    private boolean pathStyleAccess = true;
    private long presignSeconds = 300;
    private long maxFileSize = 10 * 1024 * 1024;
}
