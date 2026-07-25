package com.localfood.service;

import com.localfood.dto.UserResponse;
import com.localfood.exception.AppException;
import com.localfood.model.User;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found"));
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
