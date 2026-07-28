package com.localfood.admin.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class ReportDtos {
    private ReportDtos() {
    }

    public record CreateRequest(
            @NotNull ReportTargetType targetType,
            @NotBlank @Size(max = 64) String targetId,
            @NotNull ReportReason reason,
            @Size(max = 2000) String description) {
    }

    public record DecisionRequest(
            @NotBlank @Size(max = 2000) String note,
            @NotNull ReportAction action) {
    }

    public record Response(
            String id,
            String reporterId,
            String reporterUserName,
            ReportTargetType targetType,
            String targetId,
            ReportReason reason,
            String description,
            ReportStatus status,
            String assignedAdminId,
            String assignedAdminUserName,
            String resolutionNote,
            ReportAction resolutionAction,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime resolvedAt) {
    }
}
