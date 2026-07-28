package com.localfood.admin.user;

import com.localfood.admin.common.AdminPageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("@adminAccess.isAllowed(authentication)")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService service;

    @GetMapping
    public AdminPageResponse<AdminUserResponse> findAll(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.findAll(query, page, size);
    }

    @PatchMapping("/{id}/status")
    public AdminUserResponse updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            Authentication authentication) {
        return service.updateStatus(id, request.enabled(), authentication.getName());
    }

    @PutMapping("/{id}/roles")
    public AdminUserResponse updateRole(
            @PathVariable String id,
            @Valid @RequestBody UpdateAdminRoleRequest request,
            Authentication authentication) {
        return service.updateAdminRole(id, request.admin(), authentication.getName());
    }
}
