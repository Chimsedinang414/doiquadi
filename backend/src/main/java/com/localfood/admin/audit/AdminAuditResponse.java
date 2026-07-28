package com.localfood.admin.audit;

import java.time.Instant;

public record AdminAuditResponse(
        Long id,
        String actorUserName,
        String action,
        String targetType,
        String targetId,
        String details,
        Instant createdAt
) {
}
