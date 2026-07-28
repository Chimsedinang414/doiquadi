package com.localfood.admin.moderation;

import java.math.BigDecimal;

public record AdminLocationResponse(
        String id,
        String name,
        String address,
        String phone,
        BigDecimal averagePrice
) {
}
