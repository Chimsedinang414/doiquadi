package com.localfood.admin.user;

import com.localfood.admin.audit.AdminAuditService;
import com.localfood.admin.common.AdminPageResponse;
import com.localfood.exception.ApiException;
import com.localfood.model.Role;
import com.localfood.model.User;
import com.localfood.model.UserStatus;
import com.localfood.repository.FollowRepository;
import com.localfood.repository.PostRepository;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final FollowRepository followRepository;
    private final UserViolationRepository violationRepository;
    private final AdminAuditService auditService;

    public AdminPageResponse<AdminUserResponse> findAll(
            String query,
            UserStatus status,
            Role role,
            LocalDate createdFrom,
            LocalDate createdTo,
            int page,
            int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        LocalDateTime from = createdFrom == null ? null : createdFrom.atStartOfDay();
        LocalDateTime to = createdTo == null ? null : createdTo.plusDays(1).atStartOfDay();
        var users = userRepository.searchAdminUsers(
                query == null ? "" : query.trim(), status, role, from, to, pageable);
        return AdminPageResponse.from(users.map(this::toResponse));
    }

    public AdminUserResponse findById(String id) {
        return toResponse(requireUser(id));
    }

    public List<UserViolationResponse> findViolations(String id) {
        requireUser(id);
        return violationRepository.findByUser_IdOrderByCreatedAtDesc(id).stream()
                .map(violation -> new UserViolationResponse(
                        violation.getId(), violation.getAction(), violation.getReason(),
                        violation.getExpiresAt(), violation.getAdmin().getUserName(), violation.getCreatedAt()))
                .toList();
    }

    @Transactional
    public AdminUserResponse warn(String targetId, String reason, String actorSubject) {
        User actor = requireActor(actorSubject);
        User target = requireModeratableTarget(targetId, actor);
        target.setStatus(UserStatus.WARNING);
        target.setModerationReason(normalizeReason(reason));
        target.setWarningCount(target.getWarningCount() + 1);
        recordViolation(target, actor, UserStatus.WARNING, reason, null);
        auditService.record(actor, "USER_WARNED", "USER", targetId,
                "reason=" + normalizeReason(reason) + "; warningCount=" + target.getWarningCount());
        return toResponse(target);
    }

    @Transactional
    public AdminUserResponse suspend(
            String targetId, String reason, LocalDateTime suspendedUntil, String actorSubject) {
        if (suspendedUntil == null || !suspendedUntil.isAfter(LocalDateTime.now())) {
            throw conflict("INVALID_SUSPENSION_TIME", "Thời điểm kết thúc tạm khóa phải ở tương lai");
        }
        User actor = requireActor(actorSubject);
        User target = requireModeratableTarget(targetId, actor);
        target.setEnabled(true);
        target.setStatus(UserStatus.SUSPENDED);
        target.setSuspendedUntil(suspendedUntil);
        target.setModerationReason(normalizeReason(reason));
        invalidateSessions(target);
        recordViolation(target, actor, UserStatus.SUSPENDED, reason, suspendedUntil);
        auditService.record(actor, "USER_SUSPENDED", "USER", targetId,
                "reason=" + normalizeReason(reason) + "; until=" + suspendedUntil);
        return toResponse(target);
    }

    @Transactional
    public AdminUserResponse ban(String targetId, String reason, String actorSubject) {
        User actor = requireActor(actorSubject);
        User target = requireModeratableTarget(targetId, actor);
        target.setEnabled(false);
        target.setStatus(UserStatus.BANNED);
        target.setSuspendedUntil(null);
        target.setModerationReason(normalizeReason(reason));
        invalidateSessions(target);
        recordViolation(target, actor, UserStatus.BANNED, reason, null);
        auditService.record(actor, "USER_BANNED", "USER", targetId,
                "reason=" + normalizeReason(reason));
        return toResponse(target);
    }

    @Transactional
    public AdminUserResponse unban(String targetId, String reason, String actorSubject) {
        User actor = requireActor(actorSubject);
        User target = requireModeratableTarget(targetId, actor);
        target.setEnabled(true);
        target.setStatus(UserStatus.ACTIVE);
        target.setSuspendedUntil(null);
        target.setModerationReason(normalizeReason(reason));
        invalidateSessions(target);
        recordViolation(target, actor, UserStatus.ACTIVE, reason, null);
        auditService.record(actor, "USER_UNBANNED", "USER", targetId,
                "reason=" + normalizeReason(reason));
        return toResponse(target);
    }

    @Transactional
    public AdminUserResponse updateRoles(String targetId, Set<Role> requestedRoles, String actorSubject) {
        User actor = requireActor(actorSubject);
        if (!actor.getRoles().contains(Role.SUPER_ADMIN)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "SUPER_ADMIN_REQUIRED",
                    "Chỉ Super Admin được thay đổi quyền quản trị");
        }
        User target = requireUserForUpdate(targetId);
        Set<Role> nextRoles = new HashSet<>(requestedRoles == null ? Set.of() : requestedRoles);
        nextRoles.add(Role.USER);
        if (actor.getId().equals(target.getId()) && !nextRoles.contains(Role.SUPER_ADMIN)) {
            throw conflict("SUPER_ADMIN_SELF_DEMOTION", "Super Admin không thể tự gỡ quyền của chính mình");
        }
        Set<Role> before = new HashSet<>(target.getRoles());
        if (!before.equals(nextRoles)) {
            target.setRoles(nextRoles);
            invalidateSessions(target);
            auditService.record(actor, "ROLE_CHANGED", "USER", targetId,
                    "old=" + before + "; new=" + nextRoles);
        }
        return toResponse(target);
    }

    private User requireModeratableTarget(String targetId, User actor) {
        User target = requireUserForUpdate(targetId);
        if (actor.getId().equals(target.getId())) {
            throw conflict("ADMIN_SELF_MODERATION", "Admin không thể tự xử lý tài khoản của chính mình");
        }
        if (target.getRoles().contains(Role.SUPER_ADMIN)
                && !actor.getRoles().contains(Role.SUPER_ADMIN)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "SUPER_ADMIN_PROTECTED",
                    "Bạn không thể xử lý tài khoản Super Admin");
        }
        return target;
    }

    private void recordViolation(
            User target, User actor, UserStatus action, String reason, LocalDateTime expiresAt) {
        UserViolation violation = new UserViolation();
        violation.setUser(target);
        violation.setAdmin(actor);
        violation.setAction(action);
        violation.setReason(normalizeReason(reason));
        violation.setExpiresAt(expiresAt);
        violationRepository.save(violation);
    }

    private static void invalidateSessions(User user) {
        user.setCredentialsVersion(user.getCredentialsVersion() + 1);
    }

    private User requireActor(String authSubject) {
        return userRepository.findByAuthSubject(authSubject)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED,
                        "ADMIN_SESSION_INVALID", "Phiên quản trị không còn hợp lệ"));
    }

    private User requireUserForUpdate(String id) {
        return userRepository.findByIdForUpdate(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));
    }

    private User requireUser(String id) {
        return userRepository.findById(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));
    }

    private static String normalizeReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MODERATION_REASON_REQUIRED",
                    "Mọi thao tác kiểm duyệt đều phải có lý do");
        }
        return reason.trim();
    }

    private static ApiException conflict(String code, String message) {
        return new ApiException(HttpStatus.CONFLICT, code, message);
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(), user.getUserName(), user.getFullName(), user.getEmail(), user.isEnabled(),
                user.getStatus(), user.getSuspendedUntil(), user.getModerationReason(), user.getWarningCount(),
                new TreeSet<>(user.getRoles().stream().map(Enum::name).toList()), user.getCreatedAt(),
                postRepository.countByUser_Id(user.getId()),
                followRepository.countByFollowing_Id(user.getId()),
                followRepository.countByFollower_Id(user.getId()));
    }
}
