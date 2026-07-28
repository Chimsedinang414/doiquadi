package com.localfood.service;

import com.localfood.dto.UpdateProfileRequest;
import com.localfood.dto.UserResponse;

public interface UserService {
    UserResponse getUserById(String id);
    UserResponse updateProfile(String id, UpdateProfileRequest request);
}
