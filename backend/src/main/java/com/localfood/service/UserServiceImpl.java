package com.localfood.service;

import com.localfood.dto.UpdateProfileRequest;
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
        return toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String id, String authSubject, UpdateProfileRequest request) {
        User actor = userRepository.findByAuthSubject(authSubject)
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản đăng nhập"));
        if (!actor.getId().equals(id)) {
            throw new AppException("Bạn không có quyền chỉnh sửa hồ sơ này");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found"));

        if (request.getUserName() != null) {
            String userName = request.getUserName().trim();
            if (!userName.equalsIgnoreCase(user.getUserName())
                    && userRepository.existsByUserNameIgnoreCaseAndIdNot(userName, id)) {
                throw new AppException("Tên người dùng đã được sử dụng");
            }
            user.setUserName(userName);
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }

        userRepository.save(user);
        return toResponse(user);
    }

    private static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .userName(user.getUserName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .avatar(user.getAvatar())
                .address(user.getAddress())
                .dateOfBirth(user.getDateOfBirth())
                .bio(user.getBio())
                .createdAt(user.getCreatedAt())
                .roles(user.getRoles().stream().map(Enum::name).collect(java.util.stream.Collectors.toSet()))
                .build();
    }
}
