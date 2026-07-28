package com.localfood.admin.dashboard;

import com.localfood.admin.audit.AdminAuditLogRepository;
import com.localfood.admin.report.ReportReason;
import com.localfood.admin.report.ReportRepository;
import com.localfood.admin.report.ReportStatus;
import com.localfood.model.ContentStatus;
import com.localfood.model.LocationStatus;
import com.localfood.model.Role;
import com.localfood.model.UserStatus;
import com.localfood.repository.CommentRepository;
import com.localfood.repository.LocationRepository;
import com.localfood.repository.PostRepository;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LocationRepository locationRepository;
    private final ReportRepository reportRepository;
    private final AdminAuditLogRepository auditLogRepository;

    public AdminDashboardResponse getDashboard() {
        LocalDateTime today = LocalDate.now().atStartOfDay();
        return new AdminDashboardResponse(
                userRepository.count(),
                userRepository.countByCreatedAtAfter(today),
                userRepository.countByCreatedAtAfter(today.minusDays(6)),
                userRepository.countByCreatedAtAfter(today.minusDays(29)),
                userRepository.countByEnabledTrue(),
                userRepository.countByStatus(UserStatus.SUSPENDED),
                userRepository.countByStatus(UserStatus.BANNED),
                userRepository.countEnabledUsersWithRole(Role.ADMIN)
                        + userRepository.countEnabledUsersWithRole(Role.SUPER_ADMIN),
                postRepository.countByStatus(ContentStatus.ACTIVE),
                commentRepository.countByStatus(ContentStatus.ACTIVE),
                locationRepository.countByStatus(LocationStatus.VERIFIED),
                locationRepository.countByStatus(LocationStatus.PENDING),
                reportRepository.countByStatus(ReportStatus.PENDING),
                auditLogRepository.count(),
                0L);
    }

    public List<AdminDashboardDtos.GrowthPoint> growth() {
        List<AdminDashboardDtos.GrowthPoint> points = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int offset = 13; offset >= 0; offset--) {
            LocalDate date = today.minusDays(offset);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();
            points.add(new AdminDashboardDtos.GrowthPoint(
                    date,
                    userRepository.countByCreatedAtBetween(start, end),
                    postRepository.countByCreatedAtBetween(start, end),
                    commentRepository.countByCreatedAtBetween(start, end)));
        }
        return points;
    }

    public List<AdminDashboardDtos.ReportStatistic> reportStatistics() {
        return reportRepository.countGroupedByReason().stream()
                .map(row -> new AdminDashboardDtos.ReportStatistic((ReportReason) row[0], (Long) row[1]))
                .toList();
    }

    public List<AdminDashboardDtos.TopLocation> topLocations() {
        return postRepository.findTopLocations(ContentStatus.ACTIVE, PageRequest.of(0, 10)).stream()
                .map(row -> new AdminDashboardDtos.TopLocation((String) row[0], (String) row[1], (Long) row[2]))
                .toList();
    }
}
