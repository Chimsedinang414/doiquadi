package com.localfood.admin.security;

import com.localfood.model.Role;
import com.localfood.model.User;
import com.localfood.repository.UserRepository;
import com.localfood.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminAccessTest {

    @Test
    void currentEnabledAdminIsAllowed() {
        UserRepository repository = mock(UserRepository.class);
        User admin = adminUser();
        when(repository.findByAuthSubject(admin.getAuthSubject())).thenReturn(Optional.of(admin));
        AdminAccess access = new AdminAccess(repository);
        JwtService.TokenData token = new JwtService.TokenData(
                admin.getAuthSubject(), List.of("USER", "ADMIN"), 4);
        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                token.subject(), token, List.of());

        assertThat(access.isAllowed(authentication)).isTrue();
    }

    @Test
    void staleTokenOrRevokedDatabaseRoleIsRejected() {
        UserRepository repository = mock(UserRepository.class);
        User admin = adminUser();
        when(repository.findByAuthSubject(admin.getAuthSubject())).thenReturn(Optional.of(admin));
        AdminAccess access = new AdminAccess(repository);
        JwtService.TokenData stale = new JwtService.TokenData(
                admin.getAuthSubject(), List.of("USER", "ADMIN"), 3);
        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                stale.subject(), stale, List.of());

        assertThat(access.isAllowed(authentication)).isFalse();

        admin.setCredentialsVersion(3);
        admin.setRoles(Set.of(Role.USER));
        assertThat(access.isAllowed(authentication)).isFalse();
    }

    private static User adminUser() {
        return User.builder()
                .id("admin-1")
                .authSubject("admin-subject")
                .userName("admin")
                .email("admin@example.com")
                .password("encoded")
                .enabled(true)
                .credentialsVersion(4)
                .roles(new java.util.HashSet<>(Set.of(Role.USER, Role.ADMIN)))
                .build();
    }
}
