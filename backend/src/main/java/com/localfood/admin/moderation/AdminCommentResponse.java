package com.localfood.admin.moderation;

import com.localfood.model.ContentStatus;

import java.time.LocalDateTime;

public record AdminCommentResponse(
        String id,
        String postId,
        String postTitle,
        String authorId,
        String authorUserName,
        String content,
        ContentStatus status,
        String moderationReason,
        long reportCount,
        LocalDateTime createdAt) {
}
