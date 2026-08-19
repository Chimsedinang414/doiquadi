package com.localfood.admin.moderation;

import com.localfood.model.ContentStatus;

import java.time.LocalDateTime;
import java.util.List;

public record AdminPostResponse(
        String id,
        String authorId,
        String authorUserName,
        String title,
        String content,
        String locationName,
        Float rating,
        List<String> imageUrls,
        ContentStatus status,
        String moderationReason,
        long reportCount,
        LocalDateTime createdAt) {
}
