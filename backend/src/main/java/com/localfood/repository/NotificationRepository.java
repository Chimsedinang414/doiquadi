package com.localfood.repository;

import com.localfood.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByReceiver_IdOrderByCreatedAtDesc(String receiverId);
}