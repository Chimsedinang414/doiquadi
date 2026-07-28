package com.localfood.admin.moderation;

import com.localfood.model.FoodStatus;

public record AdminFoodResponse(
        String id,
        String name,
        String description,
        String imageUrl,
        FoodStatus status,
        String moderationReason,
        long reportCount) {
}
