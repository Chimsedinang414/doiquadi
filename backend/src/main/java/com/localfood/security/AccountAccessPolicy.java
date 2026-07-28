package com.localfood.security;

import com.localfood.model.User;
import com.localfood.model.UserStatus;

import java.time.LocalDateTime;

public final class AccountAccessPolicy {
    private AccountAccessPolicy() {
    }

    public static boolean isAllowed(User user) {
        if (user == null || !user.isEnabled() || user.getStatus() == UserStatus.BANNED
                || user.getStatus() == UserStatus.DELETED) {
            return false;
        }
        return user.getStatus() != UserStatus.SUSPENDED
                || user.getSuspendedUntil() == null
                || !user.getSuspendedUntil().isAfter(LocalDateTime.now());
    }
}
