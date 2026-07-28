package com.localfood.admin.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/dashboard")
@PreAuthorize("@adminAccess.canViewDashboard(authentication)")
@RequiredArgsConstructor
public class AdminDashboardController {
    private final AdminDashboardService service;

    @GetMapping({"", "/summary"})
    public AdminDashboardResponse getDashboard() {
        return service.getDashboard();
    }

    @GetMapping({"/user-growth", "/content-growth"})
    public List<AdminDashboardDtos.GrowthPoint> growth() {
        return service.growth();
    }

    @GetMapping("/report-statistics")
    public List<AdminDashboardDtos.ReportStatistic> reportStatistics() {
        return service.reportStatistics();
    }

    @GetMapping("/top-locations")
    public List<AdminDashboardDtos.TopLocation> topLocations() {
        return service.topLocations();
    }
}
