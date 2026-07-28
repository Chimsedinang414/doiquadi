package com.localfood.admin.moderation;

import com.localfood.model.LocationStatus;

import java.math.BigDecimal;

public record AdminLocationResponse(
        String id,
        String name,
        String address,
        Double latitude,
        Double longitude,
        String phone,
        BigDecimal averagePrice,
        LocationStatus status,
        String moderationReason,
        long reportCount) {
}
