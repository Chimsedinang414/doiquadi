package com.localfood.admin.moderation;

import com.localfood.model.ContentStatus;

import java.time.LocalDateTime;

public record AdminPostResponse(
        String id,
        String authorId,
        String authorUserName,
        String title,
        String content,
        String locationName,
        Float rating,
        ContentStatus status,
        String moderationReason,
        long reportCount,
        LocalDateTime createdAt) {
}
