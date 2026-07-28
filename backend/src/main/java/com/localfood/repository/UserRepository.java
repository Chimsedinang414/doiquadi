package com.localfood.repository;

import com.localfood.model.Role;
import com.localfood.model.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByAuthSubject(String authSubject);

    Page<User> findByEmailContainingIgnoreCaseOrUserNameContainingIgnoreCase(
            String email, String userName, Pageable pageable);

    @Query(value = """
            select distinct u from User u left join u.roles r
            where (:query = '' or lower(u.id) like lower(concat('%', :query, '%'))
                   or lower(u.email) like lower(concat('%', :query, '%'))
                   or lower(u.userName) like lower(concat('%', :query, '%'))
                   or lower(coalesce(u.fullName, '')) like lower(concat('%', :query, '%')))
              and (:status is null or u.status = :status)
              and (:role is null or r = :role)
              and (:createdFrom is null or u.createdAt >= :createdFrom)
              and (:createdTo is null or u.createdAt < :createdTo)
            """,
            countQuery = """
            select count(distinct u) from User u left join u.roles r
            where (:query = '' or lower(u.id) like lower(concat('%', :query, '%'))
                   or lower(u.email) like lower(concat('%', :query, '%'))
                   or lower(u.userName) like lower(concat('%', :query, '%'))
                   or lower(coalesce(u.fullName, '')) like lower(concat('%', :query, '%')))
              and (:status is null or u.status = :status)
              and (:role is null or r = :role)
              and (:createdFrom is null or u.createdAt >= :createdFrom)
              and (:createdTo is null or u.createdAt < :createdTo)
            """)
    Page<User> searchAdminUsers(
            @Param("query") String query,
            @Param("status") com.localfood.model.UserStatus status,
            @Param("role") Role role,
            @Param("createdFrom") LocalDateTime createdFrom,
            @Param("createdTo") LocalDateTime createdTo,
            Pageable pageable);

    @Query("select u from User u where u.enabled = true and u.id <> :viewerId and " +
            "(lower(u.userName) like :pattern or lower(coalesce(u.fullName, '')) like :pattern) " +
            "order by case when lower(u.userName) = :exact then 0 " +
            "when lower(u.userName) like :prefix then 1 else 2 end, u.userName")
    List<User> searchDiscoverableUsers(
            @Param("pattern") String pattern,
            @Param("exact") String exact,
            @Param("prefix") String prefix,
            @Param("viewerId") String viewerId,
            Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdForUpdate(@Param("id") String id);

    @Query("select count(distinct u) from User u join u.roles r where r = :role and u.enabled = true")
    long countEnabledUsersWithRole(@Param("role") Role role);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select distinct u from User u join u.roles r where r = :role and u.enabled = true")
    List<User> findEnabledUsersWithRoleForUpdate(@Param("role") Role role);

    long countByEnabledTrue();

    long countByCreatedAtAfter(LocalDateTime createdAfter);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByStatus(com.localfood.model.UserStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.email = :email")
    Optional<User> findByEmailForUpdate(@Param("email") String email);

    boolean existsByEmail(String email);
    boolean existsByUserName(String userName);
    boolean existsByUserNameIgnoreCaseAndIdNot(String userName, String id);
}
