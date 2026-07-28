package com.localfood.admin.dashboard;

public record AdminDashboardResponse(
        long users,
        long newUsersToday,
        long newUsersWeek,
        long newUsersMonth,
        long activeUsers,
        long suspendedUsers,
        long bannedUsers,
        long administrators,
        long posts,
        long comments,
        long locations,
        long pendingLocations,
        long pendingReports,
        long auditEvents,
        long storageBytes) {
}
