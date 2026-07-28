package com.localfood.admin.moderation;

import com.localfood.admin.common.AdminPageResponse;
import com.localfood.model.LocationStatus;
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
@RequestMapping("/admin/locations")
@PreAuthorize("@adminAccess.canModerateLocations(authentication)")
@RequiredArgsConstructor
public class AdminLocationController {
    private final AdminModerationService service;

    @GetMapping
    public AdminPageResponse<AdminLocationResponse> findAll(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(required = false) LocationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.findLocations(query, status, page, size);
    }

    @GetMapping("/{id}")
    public AdminLocationResponse findById(@PathVariable String id) {
        return service.findLocation(id);
    }

    @PatchMapping("/{id}/approve")
    public AdminLocationResponse approve(
            @PathVariable String id, @Valid @RequestBody ModerationRequests.Reason request,
            Authentication authentication) {
        return service.updateLocationStatus(id, LocationStatus.VERIFIED, request.reason(), authentication.getName());
    }

    @PatchMapping("/{id}/reject")
    public AdminLocationResponse reject(
            @PathVariable String id, @Valid @RequestBody ModerationRequests.Reason request,
            Authentication authentication) {
        return service.updateLocationStatus(id, LocationStatus.REJECTED, request.reason(), authentication.getName());
    }

    @PatchMapping("/{id}/status")
    public AdminLocationResponse updateStatus(
            @PathVariable String id, @Valid @RequestBody ModerationRequests.LocationState request,
            Authentication authentication) {
        return service.updateLocationStatus(id, request.status(), request.reason(), authentication.getName());
    }
}
