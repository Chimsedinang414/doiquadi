package com.localfood.controller;

import com.localfood.dto.SocialDtos;
import com.localfood.service.SocialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SocialController {
    @GetMapping("/locations/{locationId}/posts")
    public SocialDtos.PaginatedResponse<SocialDtos.PostResponse> getPostsByLocation(
            @PathVariable String locationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return socialService.getPostsByLocation(locationId, page, size);
    }
    private final SocialService socialService;

    @PutMapping("/follows")
    public SocialDtos.ActionResponse toggleFollow(
            @Valid @RequestBody SocialDtos.FollowRequest request,
            Authentication authentication) {
        return socialService.toggleFollow(authentication.getName(), request);
    }

    @GetMapping("/users/search")
    public List<SocialDtos.AccountSearchResponse> searchUsers(
            @RequestParam String query,
            Authentication authentication) {
        return socialService.searchUsers(query, authentication.getName());
    }

    @GetMapping("/users/{userId}/followers")
    public List<SocialDtos.FollowUserResponse> getFollowers(
            @PathVariable String userId,
            Authentication authentication) {
        return socialService.getFollowers(userId, authentication.getName());
    }

    @GetMapping("/users/{userId}/following")
    public List<SocialDtos.FollowUserResponse> getFollowing(
            @PathVariable String userId,
            Authentication authentication) {
        return socialService.getFollowing(userId, authentication.getName());
    }

    @GetMapping("/users/{userId}/profile")
    public SocialDtos.ProfileResponse getProfile(
            @PathVariable String userId,
            @RequestParam(required = false) String viewerId) {
        return socialService.getProfile(userId, viewerId);
    }

    @PutMapping("/favorites")
    public SocialDtos.ActionResponse toggleFavorite(
            @Valid @RequestBody SocialDtos.FavoriteRequest request) {
        return socialService.toggleFavorite(request);
    }

    @GetMapping("/users/{userId}/favorites")
    public List<SocialDtos.FavoriteResponse> getFavorites(@PathVariable String userId) {
        return socialService.getFavorites(userId);
    }

    @PostMapping("/checkins")
    public ResponseEntity<SocialDtos.CheckinResponse> checkin(
            @Valid @RequestBody SocialDtos.CheckinRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(socialService.checkin(request));
    }

    @GetMapping("/users/{userId}/checkins")
    public List<SocialDtos.CheckinResponse> getCheckins(@PathVariable String userId) {
        return socialService.getCheckins(userId);
    }

    @PostMapping("/collections")
    public ResponseEntity<SocialDtos.CollectionResponse> createCollection(
            @Valid @RequestBody SocialDtos.CreateCollectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(socialService.createCollection(request));
    }

    @GetMapping("/users/{userId}/collections")
    public List<SocialDtos.CollectionResponse> getCollections(@PathVariable String userId) {
        return socialService.getCollections(userId);
    }

    @PostMapping("/collections/{collectionId}/items")
    public SocialDtos.CollectionResponse addCollectionItem(
            @PathVariable String collectionId,
            @Valid @RequestBody SocialDtos.AddCollectionItemRequest request) {
        return socialService.addCollectionItem(collectionId, request);
    }

    @GetMapping("/users/{userId}/notifications")
    public List<SocialDtos.NotificationResponse> getNotifications(@PathVariable String userId) {
        return socialService.getNotifications(userId);
    }

    @PatchMapping("/notifications/{notificationId}/read")
    public SocialDtos.NotificationResponse markRead(
            @PathVariable String notificationId, @RequestParam String userId) {
        return socialService.markNotificationRead(notificationId, userId);
    }
}

