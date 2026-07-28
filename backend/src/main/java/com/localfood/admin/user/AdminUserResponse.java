package com.localfood.admin.user;

import com.localfood.model.UserStatus;

import java.time.LocalDateTime;
import java.util.Set;

public record AdminUserResponse(
        String id,
        String userName,
        String fullName,
        String email,
        boolean enabled,
        UserStatus status,
        LocalDateTime suspendedUntil,
        String moderationReason,
        int warningCount,
        Set<String> roles,
        LocalDateTime createdAt,
        long postsCount,
        long followersCount,
        long followingCount
) {
}
