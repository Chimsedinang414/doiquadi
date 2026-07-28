package com.localfood.service;

import com.localfood.dto.UpdateProfileRequest;
import com.localfood.exception.AppException;
import com.localfood.model.User;
import com.localfood.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl service;

    @Test
    void ownerCanChangeLocalFoodUserName() {
        User user = user("user-1", "subject-1", "old-name");
        when(userRepository.findByAuthSubject("subject-1")).thenReturn(Optional.of(user));
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(userRepository.existsByUserNameIgnoreCaseAndIdNot("new-name", "user-1"))
                .thenReturn(false);
        when(userRepository.save(user)).thenReturn(user);

        var response = service.updateProfile(
                "user-1", "subject-1",
                UpdateProfileRequest.builder().userName("new-name").build());

        assertEquals("new-name", response.getUserName());
        verify(userRepository).save(user);
    }

    @Test
    void duplicateUserNameIsRejected() {
        User user = user("user-1", "subject-1", "old-name");
        when(userRepository.findByAuthSubject("subject-1")).thenReturn(Optional.of(user));
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(userRepository.existsByUserNameIgnoreCaseAndIdNot("taken", "user-1"))
                .thenReturn(true);

        assertThrows(AppException.class, () -> service.updateProfile(
                "user-1", "subject-1",
                UpdateProfileRequest.builder().userName("taken").build()));
        verify(userRepository, never()).save(user);
    }

    @Test
    void userCannotEditAnotherProfile() {
        User actor = user("user-1", "subject-1", "owner");
        when(userRepository.findByAuthSubject("subject-1")).thenReturn(Optional.of(actor));

        assertThrows(AppException.class, () -> service.updateProfile(
                "user-2", "subject-1",
                UpdateProfileRequest.builder().userName("changed").build()));
        verify(userRepository, never()).findById("user-2");
    }

    private static User user(String id, String authSubject, String userName) {
        return User.builder()
                .id(id)
                .authSubject(authSubject)
                .userName(userName)
                .email(userName + "@example.com")
                .enabled(true)
                .build();
    }
}
