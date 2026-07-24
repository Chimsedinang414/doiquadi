package com.localfood.dto;

import java.math.BigDecimal;
import java.time.LocalTime;

public record LocationResponse(
        String id, String name, String address, Double latitude, Double longitude,
        LocalTime openTime, LocalTime closeTime, String phone, BigDecimal averagePrice) {
}
