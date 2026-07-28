package com.localfood.admin.user;

import com.localfood.model.Role;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.Set;

public final class UserModerationRequests {
    private UserModerationRequests() {
    }

    public record Reason(@NotBlank @Size(max = 500) String reason) {
    }

    public record Suspend(
            @NotBlank @Size(max = 500) String reason,
            @NotNull @Future LocalDateTime suspendedUntil) {
    }

    public record Roles(@NotEmpty Set<@NotNull Role> roles) {
    }
}
