package com.localfood.service;

import com.localfood.dto.UserResponse;

public interface UserService {
    UserResponse getUserById(String id);
}
