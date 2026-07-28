package com.localfood.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

public record LocationRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 500) String address,
        Double latitude,
        Double longitude,
        LocalTime openTime,
        LocalTime closeTime,
        @Size(max = 20) String phone,
        @DecimalMin("0.0") BigDecimal averagePrice,
        String userId,
        List<@Size(max = 1024) String> imageKeys) {
}