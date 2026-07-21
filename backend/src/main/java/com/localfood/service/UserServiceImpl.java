package com.localfood.service;

import com.localfood.dto.AuthResponse;
import com.localfood.dto.LoginRequest;
import com.localfood.dto.RegisterRequest;
import com.localfood.dto.UserResponse;
import com.localfood.exception.AppException;
import com.localfood.model.User;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email đã được sử dụng!");
        }

        String hashedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt());

        User user = new User();
        user.setUserName(request.getUserName());
        user.setEmail(request.getEmail());
        user.setPassword(hashedPassword);
        user.setBio(request.getBio());

        User savedUser = userRepository.save(user);

        return AuthResponse.builder()
                .message("Đăng ký tài khoản thành công!")
                .user(mapToUserResponse(savedUser))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("Email hoặc mật khẩu không chính xác!"));

        if (!BCrypt.checkpw(request.getPassword(), user.getPassword())) {
            throw new AppException("Email hoặc mật khẩu không chính xác!");
        }

        return AuthResponse.builder()
                .message("Đăng nhập thành công!")
                .user(mapToUserResponse(user))
                .build();
    }

    @Override
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng!"));
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .userName(user.getUserName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
