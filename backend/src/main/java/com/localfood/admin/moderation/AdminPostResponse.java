package com.localfood.admin.moderation;

import java.time.LocalDateTime;

public record AdminPostResponse(
        String id,
        String authorId,
        String authorUserName,
        String title,
        String locationName,
        Float rating,
        LocalDateTime createdAt
) {
}
