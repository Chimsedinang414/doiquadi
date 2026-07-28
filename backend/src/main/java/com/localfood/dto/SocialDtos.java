package com.localfood.dto;

import com.localfood.model.NotificationType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class SocialDtos {
    private SocialDtos() {
    }

    public record CreatePostRequest(
            @NotBlank String userId,
            String locationId,
            @NotBlank @Size(max = 255) String title,
            String content,
            @DecimalMin("0.0") @DecimalMax("5.0") Float rating,
            List<@Size(max = 500) String> imageUrls,
            List<@Size(max = 1024) String> imageKeys,
            List<@Size(max = 100) String> tags) {
    }

    public record UserSummary(String id, String userName, String fullName, String avatar) {
    }

    public record AccountSearchResponse(
            String id,
            String userName,
            String fullName,
            String avatar,
            boolean followedByViewer) {
    }

    public record ProfileResponse(
            String id,
            String userName,
            String fullName,
            String email,
            String phoneNumber,
            String avatar,
            String address,
            LocalDate dateOfBirth,
            String bio,
            LocalDateTime createdAt,
            long postsCount,
            long followersCount,
            long followingCount,
            boolean followedByViewer,
            List<PostResponse> posts) {
    }

    public record LocationSummary(String id, String name, String address) {
    }

    public record PostResponse(
            String id,
            UserSummary author,
            LocationSummary location,
            String title,
            String content,
            Float rating,
            LocalDateTime createdAt,
            List<String> imageUrls,
            List<String> tags,
            long likes,
            long comments) {
    }

    public record CreateCommentRequest(@NotBlank String userId, @NotBlank String content) {
    }

    public record CommentResponse(
            String id, UserSummary author, String content, LocalDateTime createdAt) {
    }

    public record UserActionRequest(@NotBlank String userId) {
    }

    public record FollowRequest(@NotBlank String followingId) {
    }

    public record FavoriteRequest(@NotBlank String userId, @NotBlank String locationId) {
    }

    public record CheckinRequest(@NotBlank String userId, @NotBlank String locationId) {
    }

    public record ActionResponse(boolean active) {
    }

    public record CreateCollectionRequest(
            @NotBlank String userId,
            @NotBlank @Size(max = 255) String title) {
    }

    public record AddCollectionItemRequest(@NotBlank String locationId) {
    }

    public record CollectionResponse(
            String id, String title, String userId, List<LocationSummary> locations) {
    }

    public record NotificationResponse(
            String id,
            NotificationType type,
            String referenceId,
            boolean read,
            LocalDateTime createdAt) {
    }

    public record CheckinResponse(
            String userId, LocationSummary location, LocalDateTime time) {
    }

    public record FavoriteResponse(String userId, LocationSummary location) {
    }
}
