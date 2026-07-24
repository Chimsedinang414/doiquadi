package com.localfood.repository;

import com.localfood.model.Checkin;
import com.localfood.model.CheckinId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CheckinRepository extends JpaRepository<Checkin, CheckinId> {
    List<Checkin> findByUser_IdOrderById_TimeDesc(String userId);
}