package com.localfood.admin.user;

import com.localfood.admin.audit.AdminAuditLog;
import com.localfood.admin.audit.AdminAuditLogRepository;
import com.localfood.admin.audit.AdminAuditService;
import com.localfood.exception.ApiException;
import com.localfood.model.Role;
import com.localfood.model.User;
import com.localfood.model.UserStatus;
import com.localfood.repository.FollowRepository;
import com.localfood.repository.PostRepository;
import com.localfood.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminUserServiceTest {
    private UserRepository userRepository;
    private UserViolationRepository violationRepository;
    private AdminAuditLogRepository auditRepository;
    private AdminUserService service;
    private User actor;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        violationRepository = mock(UserViolationRepository.class);
        auditRepository = mock(AdminAuditLogRepository.class);
        service = new AdminUserService(
                userRepository,
                mock(PostRepository.class),
                mock(FollowRepository.class),
                violationRepository,
                new AdminAuditService(auditRepository));
        actor = user("admin-1", "admin-subject", Set.of(Role.USER, Role.SUPER_ADMIN));
        when(userRepository.findByAuthSubject(actor.getAuthSubject())).thenReturn(Optional.of(actor));
    }

    @Test
    void administratorCannotModerateOwnAccount() {
        when(userRepository.findByIdForUpdate(actor.getId())).thenReturn(Optional.of(actor));

        assertThatThrownBy(() -> service.ban(actor.getId(), "test", actor.getAuthSubject()))
                .isInstanceOfSatisfying(ApiException.class,
                        error -> assertThat(error.getCode()).isEqualTo("ADMIN_SELF_MODERATION"));
    }

    @Test
    void superAdminCanGrantModeratorRoleAndInvalidatesTargetSessions() {
        User target = user("user-2", "user-subject", Set.of(Role.USER));
        target.setCredentialsVersion(2);
        when(userRepository.findByIdForUpdate(target.getId())).thenReturn(Optional.of(target));

        AdminUserResponse response = service.updateRoles(
                target.getId(), Set.of(Role.USER, Role.MODERATOR), actor.getAuthSubject());

        assertThat(response.roles()).containsExactlyInAnyOrder("USER", "MODERATOR");
        assertThat(target.getCredentialsVersion()).isEqualTo(3);
        ArgumentCaptor<AdminAuditLog> auditCaptor = ArgumentCaptor.forClass(AdminAuditLog.class);
        verify(auditRepository).save(auditCaptor.capture());
        assertThat(auditCaptor.getValue().getAction()).isEqualTo("ROLE_CHANGED");
    }

    @Test
    void banningUserInvalidatesSessionsAndWritesViolationAndAudit() {
        User target = user("user-2", "user-subject", Set.of(Role.USER));
        when(userRepository.findByIdForUpdate(target.getId())).thenReturn(Optional.of(target));
        when(violationRepository.save(any(UserViolation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminUserResponse response = service.ban(target.getId(), "Spam lặp lại", actor.getAuthSubject());

        assertThat(response.status()).isEqualTo(UserStatus.BANNED);
        assertThat(response.enabled()).isFalse();
        assertThat(target.getCredentialsVersion()).isEqualTo(1);
        verify(violationRepository).save(any(UserViolation.class));
        verify(auditRepository).save(org.mockito.ArgumentMatchers.argThat(
                log -> "USER_BANNED".equals(log.getAction())));
    }

    private static User user(String id, String subject, Set<Role> roles) {
        return User.builder()
                .id(id)
                .authSubject(subject)
                .userName(id)
                .email(id + "@example.com")
                .password("encoded")
                .enabled(true)
                .status(UserStatus.ACTIVE)
                .roles(new HashSet<>(roles))
                .build();
    }
}
