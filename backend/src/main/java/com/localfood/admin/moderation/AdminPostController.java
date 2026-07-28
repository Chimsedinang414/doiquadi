package com.localfood.admin.moderation;

import com.localfood.admin.common.AdminPageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/posts")
@PreAuthorize("@adminAccess.isAllowed(authentication)")
@RequiredArgsConstructor
public class AdminPostController {
    private final AdminModerationService service;

    @GetMapping
    public AdminPageResponse<AdminPostResponse> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.findPosts(page, size);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication authentication) {
        service.deletePost(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
