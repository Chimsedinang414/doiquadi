package com.localfood.admin.audit;

import com.localfood.admin.common.AdminPageResponse;
import com.localfood.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAuditService {
    private final AdminAuditLogRepository repository;

    public void record(User actor, String action, String targetType, String targetId, String details) {
        repository.save(AdminAuditLog.builder()
                .actor(actor)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
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
}
