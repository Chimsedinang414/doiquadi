package com.localfood.service;

import com.localfood.dto.MessagingDtos;
import com.localfood.dto.SocialDtos;
import com.localfood.exception.AppException;
import com.localfood.model.Conversation;
import com.localfood.model.ConversationMember;
import com.localfood.model.ConversationMemberId;
import com.localfood.model.ConversationType;
import com.localfood.model.MemberRole;
import com.localfood.model.Message;
import com.localfood.model.MessageType;
import com.localfood.model.User;
import com.localfood.repository.ConversationMemberRepository;
import com.localfood.repository.ConversationRepository;
import com.localfood.repository.FollowRepository;
import com.localfood.repository.MessageRepository;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository memberRepository;
    private final MessageRepository messageRepository;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final int PAGE_SIZE = 20;
    private static final int MAX_GROUP_MEMBERS = 50;

    // ── Mutual Follows ────────────────────────────────────────

    public List<MessagingDtos.MutualFollowResponse> getMutualFollows(String userId) {
        requireUser(userId);
        return followRepository.findMutualFollows(userId).stream()
                .map(user -> new MessagingDtos.MutualFollowResponse(
                        user.getId(), user.getUserName(), user.getFullName(), user.getAvatar()))
                .toList();
    }

    // ── Conversations ─────────────────────────────────────────

    public List<MessagingDtos.ConversationResponse> getConversations(String userId) {
        requireUser(userId);
        return memberRepository.findByIdUserId(userId).stream()
                .map(membership -> toConversationResponse(membership.getConversation(), userId))
                .sorted((a, b) -> b.updatedAt().compareTo(a.updatedAt()))
                .toList();
    }

    @Transactional
    public MessagingDtos.ConversationResponse getOrCreateDirect(MessagingDtos.CreateDirectRequest request) {
        if (request.userId().equals(request.targetUserId())) {
            throw new AppException("Không thể nhắn tin cho chính mình");
        }
        User user = requireUser(request.userId());
        User target = requireUser(request.targetUserId());
        requireMutualFollow(user.getId(), target.getId());

        // Try to find existing DIRECT conversation between these two users
        return conversationRepository.findDirectBetween(
                ConversationType.DIRECT, user.getId(), target.getId())
                .map(conv -> toConversationResponse(conv, user.getId()))
                .orElseGet(() -> {
                    Conversation conv = new Conversation();
                    conv.setType(ConversationType.DIRECT);
                    conv.setCreator(user);
                    Conversation saved = conversationRepository.save(conv);

                    addMemberEntity(saved, user, MemberRole.MEMBER);
                    addMemberEntity(saved, target, MemberRole.MEMBER);

                    // System message
                    sendSystemMessage(saved, "Cuộc trò chuyện đã được tạo");

                    return toConversationResponse(saved, user.getId());
                });
    }

    @Transactional
    public MessagingDtos.ConversationResponse createGroup(MessagingDtos.CreateGroupRequest request) {
        User creator = requireUser(request.userId());
        if (request.memberIds().size() > MAX_GROUP_MEMBERS - 1) {
            throw new AppException("Nhóm tối đa " + MAX_GROUP_MEMBERS + " thành viên");
        }

        // Validate all members are mutual follows of the creator
        List<User> members = request.memberIds().stream()
                .filter(id -> !id.equals(creator.getId()))
                .distinct()
                .map(id -> {
                    User member = requireUser(id);
                    requireMutualFollow(creator.getId(), member.getId());
                    return member;
                })
                .toList();

        Conversation conv = new Conversation();
        conv.setType(ConversationType.GROUP);
        conv.setName(request.name().trim());
        conv.setCreator(creator);
        Conversation saved = conversationRepository.save(conv);

        addMemberEntity(saved, creator, MemberRole.OWNER);
        members.forEach(member -> addMemberEntity(saved, member, MemberRole.MEMBER));

        sendSystemMessage(saved, creator.getUserName() + " đã tạo nhóm");

        return toConversationResponse(saved, creator.getId());
    }

    // ── Messages ──────────────────────────────────────────────

    public List<MessagingDtos.MessageResponse> getMessages(String conversationId, String userId, int page) {
        requireMembership(conversationId, userId);
        List<Message> messages = messageRepository.findByConversation_IdOrderByCreatedAtDesc(
                conversationId, PageRequest.of(page, PAGE_SIZE));
        // Reverse to get chronological order (Java 17 compatible)
        List<Message> chronological = new java.util.ArrayList<>(messages);
        java.util.Collections.reverse(chronological);
        return chronological.stream().map(this::toMessageResponse).toList();
    }

    @Transactional
    public MessagingDtos.MessageResponse sendMessage(String conversationId, MessagingDtos.SendMessageRequest request) {
        requireMembership(conversationId, request.userId());
        Conversation conv = requireConversation(conversationId);
        User sender = requireUser(request.userId());

        boolean hasContent = request.content() != null && !request.content().isBlank();
        boolean hasImage = request.imageUrl() != null && !request.imageUrl().isBlank();
        if (!hasContent && !hasImage) {
            throw new AppException("Tin nhắn phải có nội dung hoặc hình ảnh");
        }

        Message message = new Message();
        message.setConversation(conv);
        message.setSender(sender);

        if (hasImage) {
            message.setType(MessageType.IMAGE);
            message.setImageUrl(request.imageUrl().trim());
            message.setContent(hasContent ? request.content().trim() : null);
        } else {
            message.setType(MessageType.TEXT);
            message.setContent(request.content().trim());
        }

        Message saved = messageRepository.save(message);

        // Touch conversation to update the sort order
        conv.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conv);

        MessagingDtos.MessageResponse response = toMessageResponse(saved);

        // Broadcast to all subscribers of this conversation via WebSocket
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, response);

        return response;
    }

    // ── Group Management ──────────────────────────────────────

    @Transactional
    public MessagingDtos.ConversationResponse addMembers(
            String conversationId, MessagingDtos.AddMemberRequest request) {
        Conversation conv = requireGroupConversation(conversationId);
        requireOwnership(conversationId, request.userId());
        User owner = requireUser(request.userId());

        long currentCount = memberRepository.countByIdConversationId(conversationId);

        List<User> newMembers = request.targetUserIds().stream()
                .filter(id -> !memberRepository.existsById(new ConversationMemberId(conversationId, id)))
                .map(id -> {
                    User member = requireUser(id);
                    requireMutualFollow(owner.getId(), member.getId());
                    return member;
                })
                .toList();

        if (currentCount + newMembers.size() > MAX_GROUP_MEMBERS) {
            throw new AppException("Nhóm tối đa " + MAX_GROUP_MEMBERS + " thành viên");
        }

        newMembers.forEach(member -> {
            addMemberEntity(conv, member, MemberRole.MEMBER);
            sendSystemMessage(conv, owner.getUserName() + " đã thêm " + member.getUserName());
        });

        return toConversationResponse(conv, request.userId());
    }

    @Transactional
    public MessagingDtos.ConversationResponse removeMember(
            String conversationId, String userId, String targetUserId) {
        Conversation conv = requireGroupConversation(conversationId);

        if (userId.equals(targetUserId)) {
            // Leaving the group
            return leaveGroup(conversationId, userId);
        }

        requireOwnership(conversationId, userId);
        User owner = requireUser(userId);
        User target = requireUser(targetUserId);

        ConversationMemberId memberId = new ConversationMemberId(conversationId, targetUserId);
        if (!memberRepository.existsById(memberId)) {
            throw new AppException("Người dùng không phải thành viên của nhóm");
        }

        memberRepository.deleteById(memberId);
        sendSystemMessage(conv, owner.getUserName() + " đã xóa " + target.getUserName() + " khỏi nhóm");

        return toConversationResponse(conv, userId);
    }

    @Transactional
    public MessagingDtos.ConversationResponse leaveGroup(String conversationId, String userId) {
        Conversation conv = requireGroupConversation(conversationId);
        User user = requireUser(userId);

        ConversationMemberId memberId = new ConversationMemberId(conversationId, userId);
        if (!memberRepository.existsById(memberId)) {
            throw new AppException("Bạn không phải thành viên của nhóm này");
        }

        memberRepository.deleteById(memberId);
        sendSystemMessage(conv, user.getUserName() + " đã rời nhóm");

        return toConversationResponse(conv, userId);
    }

    @Transactional
    public MessagingDtos.ConversationResponse updateGroup(
            String conversationId, String userId, MessagingDtos.UpdateGroupRequest request) {
        Conversation conv = requireGroupConversation(conversationId);
        requireOwnership(conversationId, userId);

        conv.setName(request.name().trim());
        conversationRepository.save(conv);

        User user = requireUser(userId);
        sendSystemMessage(conv, user.getUserName() + " đã đổi tên nhóm thành \"" + request.name().trim() + "\"");

        return toConversationResponse(conv, userId);
    }

    // ── Read Status ───────────────────────────────────────────

    @Transactional
    public void markAsRead(String conversationId, String userId) {
        ConversationMemberId id = new ConversationMemberId(conversationId, userId);
        ConversationMember member = memberRepository.findById(id)
                .orElseThrow(() -> new AppException("Bạn không phải thành viên của cuộc trò chuyện này"));
        member.setLastReadAt(LocalDateTime.now());
        memberRepository.save(member);
    }

    // ── Typing Events ─────────────────────────────────────────

    public void broadcastTyping(MessagingDtos.TypingEvent event) {
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + event.conversationId() + "/typing", event);
    }

    // ── Internal Helpers ──────────────────────────────────────

    private void addMemberEntity(Conversation conversation, User user, MemberRole role) {
        ConversationMember member = new ConversationMember();
        member.setId(new ConversationMemberId(conversation.getId(), user.getId()));
        member.setConversation(conversation);
        member.setUser(user);
        member.setRole(role);
        member.setLastReadAt(LocalDateTime.now());
        memberRepository.save(member);
    }

    private void sendSystemMessage(Conversation conversation, String content) {
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(conversation.getCreator());
        message.setContent(content);
        message.setType(MessageType.SYSTEM);
        Message saved = messageRepository.save(message);

        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversation.getId(),
                toMessageResponse(saved));
    }

    private void requireMutualFollow(String userAId, String userBId) {
        var idAB = new com.localfood.model.FollowId(userAId, userBId);
        var idBA = new com.localfood.model.FollowId(userBId, userAId);
        if (!followRepository.existsById(idAB) || !followRepository.existsById(idBA)) {
            throw new AppException("Chỉ có thể nhắn tin với người đã follow lẫn nhau");
        }
    }

    private void requireMembership(String conversationId, String userId) {
        if (!memberRepository.existsById(new ConversationMemberId(conversationId, userId))) {
            throw new AppException("Bạn không phải thành viên của cuộc trò chuyện này");
        }
    }

    private void requireOwnership(String conversationId, String userId) {
        ConversationMember member = memberRepository.findById(
                new ConversationMemberId(conversationId, userId))
                .orElseThrow(() -> new AppException("Bạn không phải thành viên của nhóm này"));
        if (member.getRole() != MemberRole.OWNER) {
            throw new AppException("Chỉ chủ nhóm mới có quyền thực hiện thao tác này");
        }
    }

    private Conversation requireGroupConversation(String conversationId) {
        Conversation conv = requireConversation(conversationId);
        if (conv.getType() != ConversationType.GROUP) {
            throw new AppException("Thao tác này chỉ áp dụng cho nhóm chat");
        }
        return conv;
    }

    private MessagingDtos.ConversationResponse toConversationResponse(Conversation conv, String viewerId) {
        List<MessagingDtos.MemberResponse> members = memberRepository
                .findByIdConversationId(conv.getId()).stream()
                .map(this::toMemberResponse)
                .toList();

        MessagingDtos.MessageResponse lastMessage = messageRepository
                .findFirstByConversation_IdOrderByCreatedAtDesc(conv.getId())
                .map(this::toMessageResponse)
                .orElse(null);

        // Calculate unread count
        long unreadCount = 0;
        ConversationMember viewerMembership = memberRepository.findById(
                new ConversationMemberId(conv.getId(), viewerId)).orElse(null);
        if (viewerMembership != null && viewerMembership.getLastReadAt() != null) {
            unreadCount = messageRepository.countByConversation_IdAndCreatedAtAfter(
                    conv.getId(), viewerMembership.getLastReadAt());
        }

        // For DIRECT conversations, show the other person's info as the conversation name/avatar
        String displayName = conv.getName();
        String displayAvatar = conv.getAvatarUrl();
        if (conv.getType() == ConversationType.DIRECT) {
            members.stream()
                    .filter(m -> !m.userId().equals(viewerId))
                    .findFirst()
                    .ifPresent(otherUser -> {
                        // We can't reassign displayName/displayAvatar directly in a lambda,
                        // but we construct the response with the correct values below.
                    });
            var otherUser = members.stream()
                    .filter(m -> !m.userId().equals(viewerId))
                    .findFirst().orElse(null);
            if (otherUser != null) {
                displayName = displayName(otherUser.fullName(), otherUser.userName());
                displayAvatar = otherUser.avatar();
            }
        }

        return new MessagingDtos.ConversationResponse(
                conv.getId(), conv.getType(), displayName, displayAvatar,
                members, lastMessage, unreadCount, conv.getUpdatedAt());
    }

    private MessagingDtos.MemberResponse toMemberResponse(ConversationMember member) {
        User user = member.getUser();
        return new MessagingDtos.MemberResponse(
                user.getId(), user.getUserName(), user.getFullName(), user.getAvatar(),
                member.getRole(), member.getNickname());
    }

    private MessagingDtos.MessageResponse toMessageResponse(Message message) {
        User sender = message.getSender();
        return new MessagingDtos.MessageResponse(
                message.getId(),
                new SocialDtos.UserSummary(
                        sender.getId(), sender.getUserName(), sender.getFullName(), sender.getAvatar()),
                message.getContent(), message.getImageUrl(),
                message.getType(), message.getCreatedAt());
    }

    private User requireUser(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng"));
    }

    private static String displayName(String fullName, String userName) {
        return fullName == null || fullName.isBlank() ? userName : fullName.trim();
    }

    private Conversation requireConversation(String id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy cuộc trò chuyện"));
    }
}
