package com.localfood.dto;

import com.localfood.model.ConversationType;
import com.localfood.model.MemberRole;
import com.localfood.model.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public final class MessagingDtos {
    private MessagingDtos() {
    }

    // ── Request DTOs ──────────────────────────────────────────

    public record CreateDirectRequest(
            @NotBlank String userId,
            @NotBlank String targetUserId) {
    }

    public record CreateGroupRequest(
            @NotBlank String userId,
            @NotBlank @Size(max = 100) String name,
            @NotEmpty List<@NotBlank String> memberIds) {
    }

    public record SendMessageRequest(
            @NotBlank String userId,
            String content,
            String imageUrl) {
    }

    public record AddMemberRequest(
            @NotBlank String userId,
            @NotEmpty List<@NotBlank String> targetUserIds) {
    }

    public record UpdateGroupRequest(
            @NotBlank @Size(max = 100) String name) {
    }

    // ── Response DTOs ──────────────────────────────────────────

    public record ConversationResponse(
            String id,
            ConversationType type,
            String name,
            String avatarUrl,
            List<MemberResponse> members,
            MessageResponse lastMessage,
            long unreadCount,
            LocalDateTime updatedAt) {
    }

    public record MemberResponse(
            String userId,
            String userName,
            String fullName,
            String avatar,
            MemberRole role,
            String nickname) {
    }

    public record MessageResponse(
            String id,
            SocialDtos.UserSummary sender,
            String content,
            String imageUrl,
            MessageType type,
            LocalDateTime createdAt) {
    }

    public record MutualFollowResponse(
            String userId,
            String userName,
            String fullName,
            String avatar) {
    }

    // ── WebSocket Events ───────────────────────────────────────

    public record TypingEvent(
            String conversationId,
            String userId,
            String userName,
            boolean typing) {
    }
}
