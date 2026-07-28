package com.localfood.repository;

import com.localfood.model.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, String> {

    List<Message> findByConversation_IdOrderByCreatedAtDesc(String conversationId, Pageable pageable);

    Optional<Message> findFirstByConversation_IdOrderByCreatedAtDesc(String conversationId);

    long countByConversation_IdAndCreatedAtAfter(String conversationId, LocalDateTime since);
}
