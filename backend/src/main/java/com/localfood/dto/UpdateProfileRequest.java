package com.localfood.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    @Size(min = 3, max = 50, message = "Tên người dùng phải có từ 3 đến 50 ký tự")
    @Pattern(regexp = "^[\\\\p{L}\\\\p{N}._-]+$",
            message = "Tên người dùng chỉ được chứa chữ cái, số, dấu chấm, gạch dưới hoặc gạch ngang")
    private String userName;

    @Size(max = 100, message = "Họ tên không được vượt quá 100 ký tự")
    private String fullName;

    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phoneNumber;

    @Size(max = 500, message = "URL avatar không được vượt quá 500 ký tự")
    private String avatar;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    private LocalDate dateOfBirth;

    @Size(max = 65535, message = "Bio quá dài")
    private String bio;
}
