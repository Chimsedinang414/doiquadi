package com.localfood.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String userName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String avatar;
    private String address;
    private LocalDate dateOfBirth;
    private String bio;
    private LocalDateTime createdAt;
}
