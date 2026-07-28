package com.localfood.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Token đặt lại mật khẩu không được để trống")
        String token,
        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Size(min = 12, max = 72, message = "Mật khẩu phải có từ 12 đến 72 ký tự")
        String newPassword
) {
}
