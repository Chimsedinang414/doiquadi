package com.localfood.admin.dashboard;

import com.localfood.admin.report.ReportReason;

import java.time.LocalDate;

public final class AdminDashboardDtos {
    private AdminDashboardDtos() {
    }

    public record GrowthPoint(LocalDate date, long users, long posts, long comments) {
    }

    public record ReportStatistic(ReportReason reason, long count) {
    }

    public record TopLocation(String id, String name, long posts) {
    }
}
