package com.localfood.repository;

import com.localfood.model.ConversationMember;
import com.localfood.model.ConversationMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationMemberRepository extends JpaRepository<ConversationMember, ConversationMemberId> {

    List<ConversationMember> findByIdUserId(String userId);

    List<ConversationMember> findByIdConversationId(String conversationId);

    long countByIdConversationId(String conversationId);
}
