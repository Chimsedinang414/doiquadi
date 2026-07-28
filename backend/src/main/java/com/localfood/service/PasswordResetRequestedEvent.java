package com.localfood.service;

public record PasswordResetRequestedEvent(
        String email,
        String userName,
        String rawToken
) {
}
