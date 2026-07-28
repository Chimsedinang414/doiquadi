package com.localfood.admin.user;

import jakarta.validation.constraints.NotNull;

public record UpdateAdminRoleRequest(
        @NotNull(message = "Trạng thái quyền admin không được để trống") Boolean admin
) {
}
