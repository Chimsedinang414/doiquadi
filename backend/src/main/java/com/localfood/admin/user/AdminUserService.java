package com.localfood.admin.user;

import com.localfood.admin.audit.AdminAuditService;
import com.localfood.admin.common.AdminPageResponse;
import com.localfood.exception.ApiException;
import com.localfood.model.Role;
import com.localfood.model.User;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.TreeSet;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {
    private final UserRepository userRepository;
    private final AdminAuditService auditService;

    public AdminPageResponse<AdminUserResponse> findAll(String query, int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        var users = query == null || query.isBlank()
                ? userRepository.findAll(pageable)
                : userRepository.findByEmailContainingIgnoreCaseOrUserNameContainingIgnoreCase(
                        query.trim(), query.trim(), pageable);
        return AdminPageResponse.from(users.map(AdminUserService::toResponse));
    }

    @Transactional
    public AdminUserResponse updateStatus(String targetId, boolean enabled, String actorSubject) {
        User actor = requireActor(actorSubject);
        User target = requireUserForUpdate(targetId);
        if (!enabled && actor.getId().equals(target.getId())) {
            throw conflict("ADMIN_SELF_DISABLE", "Admin không thể tự khóa tài khoản của chính mình");
        }
        if (!enabled && target.getRoles().contains(Role.ADMIN)) {
            ensureAnotherAdministratorExists();
        }
        if (target.isEnabled() != enabled) {
            target.setEnabled(enabled);
            target.setCredentialsVersion(target.getCredentialsVersion() + 1);
            auditService.record(actor, enabled ? "USER_ENABLED" : "USER_DISABLED",
                    "USER", target.getId(), "enabled=" + enabled);
        }
        return toResponse(target);
    }

    @Transactional
    public AdminUserResponse updateAdminRole(String targetId, boolean admin, String actorSubject) {
        User actor = requireActor(actorSubject);
        User target = requireUserForUpdate(targetId);
        boolean currentlyAdmin = target.getRoles().contains(Role.ADMIN);
        if (!admin && actor.getId().equals(target.getId())) {
            throw conflict("ADMIN_SELF_DEMOTION", "Admin không thể tự gỡ quyền của chính mình");
        }
        if (!admin && currentlyAdmin) {
            ensureAnotherAdministratorExists();
        }
        if (admin != currentlyAdmin) {
            target.getRoles().add(Role.USER);
            if (admin) {
                target.getRoles().add(Role.ADMIN);
            } else {
                target.getRoles().remove(Role.ADMIN);
            }
            target.setCredentialsVersion(target.getCredentialsVersion() + 1);
            auditService.record(actor, admin ? "ADMIN_ROLE_GRANTED" : "ADMIN_ROLE_REVOKED",
                    "USER", target.getId(), "admin=" + admin);
        }
        return toResponse(target);
    }

    private void ensureAnotherAdministratorExists() {
        if (userRepository.findEnabledUsersWithRoleForUpdate(Role.ADMIN).size() <= 1) {
            throw conflict("LAST_ADMIN_REQUIRED", "Hệ thống phải luôn còn ít nhất một admin đang hoạt động");
        }
    }

    private User requireActor(String authSubject) {
        return userRepository.findByAuthSubject(authSubject)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED,
                        "ADMIN_SESSION_INVALID", "Phiên quản trị không còn hợp lệ"));
    }

    private User requireUserForUpdate(String id) {
        return userRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "USER_NOT_FOUND", "Không tìm thấy người dùng"));
    }

    private static ApiException conflict(String code, String message) {
        return new ApiException(HttpStatus.CONFLICT, code, message);
    }

    private static AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(), user.getUserName(), user.getEmail(), user.isEnabled(),
                new TreeSet<>(user.getRoles().stream().map(Enum::name).toList()), user.getCreatedAt());
    }
}
