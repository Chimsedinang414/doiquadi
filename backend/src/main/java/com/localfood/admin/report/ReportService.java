package com.localfood.admin.report;

import com.localfood.admin.audit.AdminAuditService;
import com.localfood.admin.common.AdminPageResponse;
import com.localfood.admin.moderation.AdminModerationService;
import com.localfood.admin.user.AdminUserService;
import com.localfood.exception.ApiException;
import com.localfood.model.ContentStatus;
import com.localfood.model.LocationStatus;
import com.localfood.model.User;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {
    private static final List<ReportStatus> OPEN_STATUSES =
            List.of(ReportStatus.PENDING, ReportStatus.REVIEWING, ReportStatus.APPEALED);

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final AdminModerationService moderationService;
    private final AdminUserService adminUserService;
    private final AdminAuditService auditService;

    @Transactional
    public ReportDtos.Response create(ReportDtos.CreateRequest request, String reporterSubject) {
        User reporter = requireUserBySubject(reporterSubject);
        String targetId = request.targetId().trim();
        if (request.targetType() == ReportTargetType.USER && reporter.getId().equals(targetId)) {
            throw new ApiException(HttpStatus.CONFLICT, "SELF_REPORT_NOT_ALLOWED",
                    "Bạn không thể báo cáo chính tài khoản của mình");
        }
        if (reportRepository.existsByReporter_IdAndTargetTypeAndTargetIdAndStatusIn(
                reporter.getId(), request.targetType(), targetId, OPEN_STATUSES)) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_REPORT",
                    "Bạn đã có một báo cáo đang được xử lý cho nội dung này");
        }
        Report report = new Report();
        report.setReporter(reporter);
        report.setTargetType(request.targetType());
        report.setTargetId(targetId);
        report.setReason(request.reason());
        report.setDescription(trimToNull(request.description()));
        return toResponse(reportRepository.save(report));
    }

    public AdminPageResponse<ReportDtos.Response> findAll(
            String query, ReportStatus status, ReportTargetType targetType, int page, int size) {
        var pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return AdminPageResponse.from(reportRepository.search(
                query == null ? "" : query.trim(), status, targetType, pageable).map(this::toResponse));
    }

    public ReportDtos.Response findById(String id) {
        return toResponse(requireReport(id));
    }

    @Transactional
    public ReportDtos.Response assign(String id, String actorSubject) {
        User actor = requireUserBySubject(actorSubject);
        Report report = requireReport(id);
        ensureOpen(report);
        report.setAssignedAdmin(actor);
        report.setStatus(ReportStatus.REVIEWING);
        auditService.record(actor, "REPORT_ASSIGNED", "REPORT", id,
                "assignedAdmin=" + actor.getId());
        return toResponse(report);
    }

    @Transactional
    public ReportDtos.Response decide(
            String id, ReportDtos.DecisionRequest request, ReportStatus decision, String actorSubject) {
        User actor = requireUserBySubject(actorSubject);
        Report report = requireReport(id);
        ensureOpen(report);
        report.setAssignedAdmin(actor);
        report.setStatus(decision);
        report.setResolutionNote(request.note().trim());
        report.setResolutionAction(decision == ReportStatus.REJECTED ? ReportAction.NONE : request.action());
        if (decision == ReportStatus.RESOLVED) {
            applyResolution(report, request.action(), request.note(), actorSubject);
        }
        report.setResolvedAt(LocalDateTime.now());
        auditService.record(actor,
                decision == ReportStatus.RESOLVED ? "REPORT_RESOLVED" : "REPORT_REJECTED",
                "REPORT", id, "reason=" + request.note().trim());
        return toResponse(report);
    }

    private Report requireReport(String id) {
        return reportRepository.findById(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "REPORT_NOT_FOUND", "Không tìm thấy báo cáo"));
    }

    private User requireUserBySubject(String subject) {
        return userRepository.findByAuthSubject(subject).orElseThrow(() ->
                new ApiException(HttpStatus.UNAUTHORIZED, "SESSION_INVALID", "Phiên đăng nhập không hợp lệ"));
    }

    private static void ensureOpen(Report report) {
        if (!OPEN_STATUSES.contains(report.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "REPORT_ALREADY_CLOSED", "Báo cáo đã được đóng");
        }
    }

    private ReportDtos.Response toResponse(Report report) {
        User admin = report.getAssignedAdmin();
        return new ReportDtos.Response(
                report.getId(), report.getReporter().getId(), report.getReporter().getUserName(),
                report.getTargetType(), report.getTargetId(), report.getReason(), report.getDescription(),
                report.getStatus(), admin == null ? null : admin.getId(),
                admin == null ? null : admin.getUserName(), report.getResolutionNote(),
                report.getResolutionAction(),
                report.getCreatedAt(), report.getUpdatedAt(), report.getResolvedAt());
    }

    private void applyResolution(Report report, ReportAction action, String reason, String actorSubject) {
        if (action == ReportAction.NONE) return;
        switch (report.getTargetType()) {
            case POST -> {
                requireContentAction(action);
                moderationService.updatePostStatus(report.getTargetId(),
                        action == ReportAction.DELETE ? ContentStatus.DELETED : ContentStatus.HIDDEN,
                        reason, actorSubject);
            }
            case COMMENT -> {
                requireContentAction(action);
                moderationService.updateCommentStatus(report.getTargetId(),
                        action == ReportAction.DELETE ? ContentStatus.DELETED : ContentStatus.HIDDEN,
                        reason, actorSubject);
            }
            case LOCATION -> {
                requireContentAction(action);
                moderationService.updateLocationStatus(report.getTargetId(),
                        action == ReportAction.DELETE ? LocationStatus.PERMANENTLY_CLOSED : LocationStatus.REJECTED,
                        reason, actorSubject);
            }
            case USER -> {
                if (action != ReportAction.BAN) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_REPORT_ACTION",
                            "Báo cáo tài khoản chỉ hỗ trợ hành động BAN hoặc NONE");
                }
                adminUserService.ban(report.getTargetId(), reason, actorSubject);
            }
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_REPORT_ACTION",
                    "Hành động không phù hợp với loại báo cáo");
        }
    }

    private static void requireContentAction(ReportAction action) {
        if (action != ReportAction.HIDE && action != ReportAction.DELETE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_REPORT_ACTION",
                    "Nội dung chỉ hỗ trợ hành động HIDE hoặc DELETE");
        }
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
