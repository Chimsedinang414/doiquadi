package com.localfood.admin.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserViolationRepository extends JpaRepository<UserViolation, Long> {
    List<UserViolation> findByUser_IdOrderByCreatedAtDesc(String userId);
}
