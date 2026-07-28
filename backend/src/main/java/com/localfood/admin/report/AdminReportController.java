package com.localfood.admin.report;

import com.localfood.admin.common.AdminPageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/reports")
@PreAuthorize("@adminAccess.canHandleReports(authentication)")
@RequiredArgsConstructor
public class AdminReportController {
    private final ReportService service;

    @GetMapping
    public AdminPageResponse<ReportDtos.Response> findAll(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) ReportTargetType targetType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.findAll(query, status, targetType, page, size);
    }

    @GetMapping("/{id}")
    public ReportDtos.Response findById(@PathVariable String id) {
        return service.findById(id);
    }

    @PatchMapping("/{id}/assign")
    public ReportDtos.Response assign(@PathVariable String id, Authentication authentication) {
        return service.assign(id, authentication.getName());
    }

    @PatchMapping("/{id}/resolve")
    public ReportDtos.Response resolve(
            @PathVariable String id,
            @Valid @RequestBody ReportDtos.DecisionRequest request,
            Authentication authentication) {
        return service.decide(id, request, ReportStatus.RESOLVED, authentication.getName());
    }

    @PatchMapping("/{id}/reject")
    public ReportDtos.Response reject(
            @PathVariable String id,
            @Valid @RequestBody ReportDtos.DecisionRequest request,
            Authentication authentication) {
        return service.decide(id, request, ReportStatus.REJECTED, authentication.getName());
    }
}
