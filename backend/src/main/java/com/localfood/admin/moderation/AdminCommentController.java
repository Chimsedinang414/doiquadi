package com.localfood.admin.moderation;

import com.localfood.admin.common.AdminPageResponse;
import com.localfood.model.ContentStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/comments")
@PreAuthorize("@adminAccess.canModerateContent(authentication)")
@RequiredArgsConstructor
public class AdminCommentController {
    private final AdminModerationService service;

    @GetMapping
    public AdminPageResponse<AdminCommentResponse> findAll(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(required = false) ContentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.findComments(query, status, page, size);
    }

    @GetMapping("/{id}")
    public AdminCommentResponse findById(@PathVariable String id) {
        return service.findComment(id);
    }

    @PatchMapping("/{id}/hide")
    public AdminCommentResponse hide(@PathVariable String id, @Valid @RequestBody ModerationRequests.Reason request,
                                     Authentication authentication) {
        return service.updateCommentStatus(id, ContentStatus.HIDDEN, request.reason(), authentication.getName());
    }

    @PatchMapping("/{id}/restore")
    public AdminCommentResponse restore(@PathVariable String id, @Valid @RequestBody ModerationRequests.Reason request,
                                        Authentication authentication) {
        return service.updateCommentStatus(id, ContentStatus.ACTIVE, request.reason(), authentication.getName());
    }

    @DeleteMapping("/{id}")
    public AdminCommentResponse delete(@PathVariable String id, @Valid @RequestBody ModerationRequests.Reason request,
                                       Authentication authentication) {
        return service.updateCommentStatus(id, ContentStatus.DELETED, request.reason(), authentication.getName());
    }
}
