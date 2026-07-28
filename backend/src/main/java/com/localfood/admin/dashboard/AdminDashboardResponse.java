package com.localfood.admin.dashboard;

public record AdminDashboardResponse(
        long users,
        long activeUsers,
        long administrators,
        long posts,
        long locations,
        long auditEvents
) {
}
