package com.localfood.admin.audit;

import com.localfood.admin.common.AdminPageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/audit-logs")
@PreAuthorize("@adminAccess.canViewAudit(authentication)")
@RequiredArgsConstructor
public class AdminAuditController {
    private final AdminAuditService service;

    @GetMapping
    public AdminPageResponse<AdminAuditResponse> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        return service.findAll(page, size);
    }

    @GetMapping("/{id}")
    public AdminAuditResponse findById(@PathVariable long id) {
        return service.findById(id);
    }
}
