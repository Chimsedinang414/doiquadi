package com.localfood.admin.user;

import com.localfood.model.UserStatus;

import java.time.LocalDateTime;

public record UserViolationResponse(
        Long id,
        UserStatus action,
        String reason,
        LocalDateTime expiresAt,
        String adminUserName,
        LocalDateTime createdAt) {
}
