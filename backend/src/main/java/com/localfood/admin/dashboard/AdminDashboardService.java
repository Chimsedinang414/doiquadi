package com.localfood.admin.dashboard;

import com.localfood.admin.audit.AdminAuditLogRepository;
import com.localfood.model.Role;
import com.localfood.repository.LocationRepository;
import com.localfood.repository.PostRepository;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final LocationRepository locationRepository;
    private final AdminAuditLogRepository auditLogRepository;

    public AdminDashboardResponse getDashboard() {
        return new AdminDashboardResponse(
                userRepository.count(),
                userRepository.countByEnabledTrue(),
                userRepository.countEnabledUsersWithRole(Role.ADMIN),
                postRepository.count(),
                locationRepository.count(),
                auditLogRepository.count());
    }
}
