package com.localfood.admin.security;

import com.localfood.model.Role;
import com.localfood.model.User;
import com.localfood.repository.UserRepository;
import com.localfood.security.AccountAccessPolicy;
import com.localfood.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Optional;
import java.util.Set;

@Component("adminAccess")
@RequiredArgsConstructor
public class AdminAccess {
    private static final Set<Role> ALL_ADMIN_ROLES = EnumSet.of(
            Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR, Role.LOCATION_MODERATOR,
            Role.SUPPORT, Role.ANALYST);

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public boolean isAllowed(Authentication authentication) {
        return validUser(authentication).filter(user -> hasAny(user, ALL_ADMIN_ROLES)).isPresent();
    }

    @Transactional(readOnly = true)
    public boolean isSuperAdmin(Authentication authentication) {
        return validUser(authentication).filter(user -> user.getRoles().contains(Role.SUPER_ADMIN)).isPresent();
    }

    @Transactional(readOnly = true)
    public boolean canManageUsers(Authentication authentication) {
        return validUser(authentication).filter(user -> hasAny(user,
                Set.of(Role.SUPER_ADMIN, Role.ADMIN))).isPresent();
    }

    @Transactional(readOnly = true)
    public boolean canModerateContent(Authentication authentication) {
        return validUser(authentication).filter(user -> hasAny(user,
                Set.of(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR))).isPresent();
    }

    @Transactional(readOnly = true)
    public boolean canModerateLocations(Authentication authentication) {
        return validUser(authentication).filter(user -> hasAny(user,
                Set.of(Role.SUPER_ADMIN, Role.ADMIN, Role.LOCATION_MODERATOR))).isPresent();
    }

    @Transactional(readOnly = true)
    public boolean canHandleReports(Authentication authentication) {
        return validUser(authentication).filter(user -> hasAny(user,
                Set.of(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR))).isPresent();
    }

    @Transactional(readOnly = true)
    public boolean canViewDashboard(Authentication authentication) {
        return isAllowed(authentication);
    }

    @Transactional(readOnly = true)
    public boolean canViewAudit(Authentication authentication) {
        return validUser(authentication).filter(user -> hasAny(user,
                Set.of(Role.SUPER_ADMIN, Role.ADMIN, Role.ANALYST))).isPresent();
    }

    private Optional<User> validUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getCredentials() instanceof JwtService.TokenData token)) {
            return Optional.empty();
        }
        return userRepository.findByAuthSubject(token.subject())
                .filter(AccountAccessPolicy::isAllowed)
                .filter(user -> user.getCredentialsVersion() == token.credentialsVersion());
    }

    private static boolean hasAny(User user, Set<Role> roles) {
        return user.getRoles().stream().anyMatch(roles::contains);
    }
}
