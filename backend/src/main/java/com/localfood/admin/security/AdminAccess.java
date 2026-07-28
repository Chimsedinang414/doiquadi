package com.localfood.admin.security;

import com.localfood.model.Role;
import com.localfood.repository.UserRepository;
import com.localfood.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component("adminAccess")
@RequiredArgsConstructor
public class AdminAccess {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public boolean isAllowed(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getCredentials() instanceof JwtService.TokenData token)) {
            return false;
        }
        return userRepository.findByAuthSubject(token.subject())
                .filter(user -> user.isEnabled()
                        && user.getCredentialsVersion() == token.credentialsVersion()
                        && user.getRoles().contains(Role.ADMIN))
                .isPresent();
    }
}
