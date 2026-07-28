package com.localfood.admin.user;

import java.time.LocalDateTime;
import java.util.Set;

public record AdminUserResponse(
        String id,
        String userName,
        String email,
        boolean enabled,
        Set<String> roles,
        LocalDateTime createdAt
) {
}
