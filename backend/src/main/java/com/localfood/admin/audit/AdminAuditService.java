package com.localfood.admin.audit;

import com.localfood.admin.common.AdminPageResponse;
import com.localfood.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class AdminAuditService {
    private final AdminAuditLogRepository repository;

    public void record(User actor, String action, String targetType, String targetId, String details) {
        String requestMetadata = requestMetadata();
        repository.save(AdminAuditLog.builder()
                .actor(actor)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details((details == null ? "" : details) + requestMetadata)
                .build());
    }

    @Transactional(readOnly = true)
    public AdminPageResponse<AdminAuditResponse> findAll(int page, int size) {
        var result = repository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)));
        return AdminPageResponse.from(result.map(log -> new AdminAuditResponse(
                log.getId(),
                log.getActor() == null ? "deleted-user" : log.getActor().getUserName(),
                log.getAction(),
                log.getTargetType(),
                log.getTargetId(),
                log.getDetails(),
                log.getCreatedAt())));
    }

    @Transactional(readOnly = true)
    public AdminAuditResponse findById(long id) {
        AdminAuditLog log = repository.findById(id).orElseThrow(() ->
                new com.localfood.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND,
                        "AUDIT_LOG_NOT_FOUND", "Không tìm thấy nhật ký quản trị"));
        return new AdminAuditResponse(
                log.getId(), log.getActor() == null ? "deleted-user" : log.getActor().getUserName(),
                log.getAction(), log.getTargetType(), log.getTargetId(), log.getDetails(), log.getCreatedAt());
    }

    private static String requestMetadata() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) {
            return "";
        }
        var request = attributes.getRequest();
        String forwarded = request.getHeader("X-Forwarded-For");
        String ip = forwarded == null || forwarded.isBlank()
                ? request.getRemoteAddr() : forwarded.split(",", 2)[0].trim();
        String userAgent = request.getHeader("User-Agent");
        return "; ip=" + sanitize(ip, 45) + "; userAgent=" + sanitize(userAgent, 300);
    }

    private static String sanitize(String value, int maxLength) {
        if (value == null) return "";
        String clean = value.replaceAll("[\\\\r\\\\n]+", " ").trim();
        return clean.length() <= maxLength ? clean : clean.substring(0, maxLength);
    }
}
