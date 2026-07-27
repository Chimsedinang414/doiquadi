package com.localfood.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;

@Data
public class RegisterRequest {

    @NotBlank(message = "Tên người dùng không được để trống")
    @Size(min = 3, max = 50, message = "Tên người dùng phải từ 3 đến 50 ký tự")
    private String userName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Định dạng email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 12, max = 72, message = "Password must contain 12 to 72 characters")
    @ToString.Exclude
    private String password;

    @Size(max = 65535)
    private String bio;
}
