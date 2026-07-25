package com.localfood.controller;

import com.localfood.dto.UserResponse;
import com.localfood.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/users/{id}")
    public UserResponse getById(@PathVariable String id) {
        return userService.getUserById(id);
    }
}
