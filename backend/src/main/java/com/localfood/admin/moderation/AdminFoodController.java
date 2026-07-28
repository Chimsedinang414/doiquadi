package com.localfood.admin.moderation;

import com.localfood.admin.common.AdminPageResponse;
import com.localfood.model.FoodStatus;
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
@RequestMapping("/admin/dishes")
@PreAuthorize("@adminAccess.canModerateLocations(authentication)")
@RequiredArgsConstructor
public class AdminFoodController {
    private final AdminModerationService service;

    @GetMapping
    public AdminPageResponse<AdminFoodResponse> findAll(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(required = false) FoodStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.findFoods(query, status, page, size);
    }

    @PatchMapping("/{id}")
    public AdminFoodResponse update(
            @PathVariable String id,
            @Valid @RequestBody ModerationRequests.FoodUpdate request,
            Authentication authentication) {
        return service.updateFood(id, request, authentication.getName());
    }
}
