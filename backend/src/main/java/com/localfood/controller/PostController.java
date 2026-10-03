package com.localfood.controller;

import com.localfood.dto.SocialDtos;
import com.localfood.service.SocialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {
    private final SocialService socialService;

    @GetMapping
    public SocialDtos.PaginatedResponse<SocialDtos.PostResponse> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return socialService.getPosts(page, size);
    }

    @GetMapping("/{postId}")
    public SocialDtos.PostResponse findById(@PathVariable String postId) {
        return socialService.getPost(postId);
    }

    @PostMapping
    public ResponseEntity<SocialDtos.PostResponse> create(
            @Valid @RequestBody SocialDtos.CreatePostRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(socialService.createPost(request));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<SocialDtos.PostResponse> update(
            @PathVariable String postId,
            @Valid @RequestBody SocialDtos.UpdatePostRequest request) {
        return ResponseEntity.ok(socialService.updatePost(postId, request));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> delete(
            @PathVariable String postId, @RequestParam String userId) {
        socialService.deletePost(postId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{postId}/comments")
    public List<SocialDtos.CommentResponse> getComments(@PathVariable String postId) {
        return socialService.getComments(postId);
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<SocialDtos.CommentResponse> comment(
            @PathVariable String postId,
            @Valid @RequestBody SocialDtos.CreateCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(socialService.addComment(postId, request));
    }

    @PutMapping("/{postId}/like")
    public SocialDtos.ActionResponse toggleLike(
            @PathVariable String postId,
            @Valid @RequestBody SocialDtos.UserActionRequest request) {
        return socialService.toggleLike(postId, request.userId());
    }
}