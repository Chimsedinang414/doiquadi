package com.localfood.service;

import com.localfood.dto.AuthResponse;
import com.localfood.dto.LoginRequest;
import com.localfood.dto.RegisterRequest;
import com.localfood.dto.UserResponse;

public interface UserService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserResponse getUserById(String id);
}
