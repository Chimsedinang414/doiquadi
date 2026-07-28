package com.localfood.admin.report;

import com.localfood.admin.audit.AdminAuditLogRepository;
import com.localfood.admin.audit.AdminAuditService;
import com.localfood.admin.moderation.AdminModerationService;
import com.localfood.admin.user.AdminUserService;
import com.localfood.exception.ApiException;
import com.localfood.model.ContentStatus;
import com.localfood.model.User;
import com.localfood.model.Post;
import com.localfood.repository.CommentRepository;
import com.localfood.repository.FoodRepository;
import com.localfood.repository.LocationRepository;
import com.localfood.repository.PostRepository;
import com.localfood.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ReportServiceTest {
    @Test
    void duplicateOpenReportIsRejected() {
        ReportRepository reportRepository = mock(ReportRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        ReportService service = service(reportRepository, userRepository, null);
        User reporter = user("reporter", "reporter-subject");
        when(userRepository.findByAuthSubject(reporter.getAuthSubject())).thenReturn(Optional.of(reporter));
        when(reportRepository.existsByReporter_IdAndTargetTypeAndTargetIdAndStatusIn(
                org.mockito.ArgumentMatchers.eq(reporter.getId()),
                org.mockito.ArgumentMatchers.eq(ReportTargetType.POST),
                org.mockito.ArgumentMatchers.eq("post-1"), anyList())).thenReturn(true);

        assertThatThrownBy(() -> service.create(new ReportDtos.CreateRequest(
                ReportTargetType.POST, "post-1", ReportReason.SPAM, "Trùng"), reporter.getAuthSubject()))
                .isInstanceOfSatisfying(ApiException.class,
                        error -> org.assertj.core.api.Assertions.assertThat(error.getCode()).isEqualTo("DUPLICATE_REPORT"));
    }

    @Test
    void resolvingPostReportAppliesModerationAction() {
        ReportRepository reportRepository = mock(ReportRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        PostRepository postRepository = mock(PostRepository.class);
        AdminModerationService moderationService = new AdminModerationService(
                postRepository,
                mock(CommentRepository.class),
                mock(LocationRepository.class),
                mock(FoodRepository.class),
                reportRepository,
                userRepository,
                new AdminAuditService(mock(AdminAuditLogRepository.class)));
        ReportService service = service(reportRepository, userRepository, moderationService);
        User reporter = user("reporter", "reporter-subject");
        User admin = user("admin", "admin-subject");
        Report report = new Report();
        report.setId("report-1");
        report.setReporter(reporter);
        report.setTargetType(ReportTargetType.POST);
        report.setTargetId("post-1");
        report.setReason(ReportReason.SPAM);
        report.setStatus(ReportStatus.REVIEWING);
        Post post = new Post();
        post.setId("post-1");
        post.setUser(reporter);
        post.setTitle("Spam");
        post.setStatus(ContentStatus.ACTIVE);
        when(userRepository.findByAuthSubject(admin.getAuthSubject())).thenReturn(Optional.of(admin));
        when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
        when(postRepository.findById(post.getId())).thenReturn(Optional.of(post));

        service.decide(report.getId(), new ReportDtos.DecisionRequest("Ẩn vì spam", ReportAction.HIDE),
                ReportStatus.RESOLVED, admin.getAuthSubject());

        org.assertj.core.api.Assertions.assertThat(post.getStatus()).isEqualTo(ContentStatus.HIDDEN);
        org.assertj.core.api.Assertions.assertThat(report.getResolutionAction()).isEqualTo(ReportAction.HIDE);
    }

    private static ReportService service(
            ReportRepository reportRepository,
            UserRepository userRepository,
            AdminModerationService moderationService) {
        return new ReportService(
                reportRepository,
                userRepository,
                moderationService,
                null,
                new AdminAuditService(mock(AdminAuditLogRepository.class)));
    }

    private static User user(String id, String subject) {
        User user = new User();
        user.setId(id);
        user.setAuthSubject(subject);
        user.setUserName(id);
        user.setEmail(id + "@example.com");
        return user;
    }
}
