package com.localfood.repository;

import com.localfood.model.Conversation;
import com.localfood.model.ConversationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, String> {

    @Query("SELECT c FROM Conversation c " +
           "WHERE c.type = :type " +
           "AND EXISTS (SELECT m1 FROM ConversationMember m1 WHERE m1.conversation = c AND m1.user.id = :userA) " +
           "AND EXISTS (SELECT m2 FROM ConversationMember m2 WHERE m2.conversation = c AND m2.user.id = :userB)")
    Optional<Conversation> findDirectBetween(
            @Param("type") ConversationType type,
            @Param("userA") String userAId,
            @Param("userB") String userBId);
}
