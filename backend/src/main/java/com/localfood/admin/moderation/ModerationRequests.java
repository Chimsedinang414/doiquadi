package com.localfood.admin.moderation;

import com.localfood.model.FoodStatus;
import com.localfood.model.LocationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class ModerationRequests {
    private ModerationRequests() {
    }

    public record Reason(@NotBlank @Size(max = 500) String reason) {
    }

    public record LocationState(
            @NotNull LocationStatus status,
            @NotBlank @Size(max = 500) String reason) {
    }

    public record FoodUpdate(
            @NotBlank @Size(max = 255) String name,
            @Size(max = 2000) String description,
            @Size(max = 500) String imageUrl,
            @NotNull FoodStatus status,
            @NotBlank @Size(max = 500) String reason) {
    }
}
