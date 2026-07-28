package com.localfood.admin.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/dashboard")
@PreAuthorize("@adminAccess.isAllowed(authentication)")
@RequiredArgsConstructor
public class AdminDashboardController {
    private final AdminDashboardService service;

    @GetMapping
    public AdminDashboardResponse getDashboard() {
        return service.getDashboard();
    }
}
