package com.localfood.admin.user;

import com.localfood.admin.common.AdminPageResponse;
import com.localfood.model.Role;
import com.localfood.model.UserStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("@adminAccess.canManageUsers(authentication)")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService service;

    @GetMapping
    public AdminPageResponse<AdminUserResponse> findAll(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.findAll(query, status, role, createdFrom, createdTo, page, size);
    }

    @GetMapping("/{id}")
    public AdminUserResponse findById(@PathVariable String id) {
        return service.findById(id);
    }

    @GetMapping("/{id}/violations")
    public List<UserViolationResponse> violations(@PathVariable String id) {
        return service.findViolations(id);
    }

    @PatchMapping("/{id}/warn")
    public AdminUserResponse warn(
            @PathVariable String id,
            @Valid @RequestBody UserModerationRequests.Reason request,
            Authentication authentication) {
        return service.warn(id, request.reason(), authentication.getName());
    }

    @PatchMapping("/{id}/suspend")
    public AdminUserResponse suspend(
            @PathVariable String id,
            @Valid @RequestBody UserModerationRequests.Suspend request,
            Authentication authentication) {
        return service.suspend(id, request.reason(), request.suspendedUntil(), authentication.getName());
    }

    @PatchMapping("/{id}/ban")
    public AdminUserResponse ban(
            @PathVariable String id,
            @Valid @RequestBody UserModerationRequests.Reason request,
            Authentication authentication) {
        return service.ban(id, request.reason(), authentication.getName());
    }

    @PatchMapping("/{id}/unban")
    public AdminUserResponse unban(
            @PathVariable String id,
            @Valid @RequestBody UserModerationRequests.Reason request,
            Authentication authentication) {
        return service.unban(id, request.reason(), authentication.getName());
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("@adminAccess.isSuperAdmin(authentication)")
    public AdminUserResponse updateRoles(
            @PathVariable String id,
            @Valid @RequestBody UserModerationRequests.Roles request,
            Authentication authentication) {
        return service.updateRoles(id, request.roles(), authentication.getName());
    }
}
