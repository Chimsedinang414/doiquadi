package com.localfood.repository;

import com.localfood.model.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import com.localfood.model.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByAuthSubject(String authSubject);

    Page<User> findByEmailContainingIgnoreCaseOrUserNameContainingIgnoreCase(
            String email, String userName, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdForUpdate(@Param("id") String id);

    @Query("select count(distinct u) from User u join u.roles r where r = :role and u.enabled = true")
    long countEnabledUsersWithRole(@Param("role") Role role);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select distinct u from User u join u.roles r where r = :role and u.enabled = true")
    List<User> findEnabledUsersWithRoleForUpdate(@Param("role") Role role);

    long countByEnabledTrue();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.email = :email")
    Optional<User> findByEmailForUpdate(@Param("email") String email);

    boolean existsByEmail(String email);
    boolean existsByUserName(String userName);
}
