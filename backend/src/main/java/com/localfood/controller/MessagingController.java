package com.localfood.controller;

import com.localfood.dto.MessagingDtos;
import com.localfood.service.MessagingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;

    // ── REST Endpoints ────────────────────────────────────────

    @GetMapping("/messaging/mutual-follows")
    public List<MessagingDtos.MutualFollowResponse> getMutualFollows(@RequestParam String userId) {
        return messagingService.getMutualFollows(userId);
    }

    @GetMapping("/messaging/conversations")
    public List<MessagingDtos.ConversationResponse> getConversations(@RequestParam String userId) {
        return messagingService.getConversations(userId);
    }

    @PostMapping("/messaging/conversations/direct")
    public ResponseEntity<MessagingDtos.ConversationResponse> createDirect(
            @Valid @RequestBody MessagingDtos.CreateDirectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messagingService.getOrCreateDirect(request));
    }

    @PostMapping("/messaging/conversations/group")
    public ResponseEntity<MessagingDtos.ConversationResponse> createGroup(
            @Valid @RequestBody MessagingDtos.CreateGroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messagingService.createGroup(request));
    }

    @GetMapping("/messaging/conversations/{id}/messages")
    public List<MessagingDtos.MessageResponse> getMessages(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam(defaultValue = "0") int page) {
        return messagingService.getMessages(id, userId, page);
    }

    @PostMapping("/messaging/conversations/{id}/messages")
    public ResponseEntity<MessagingDtos.MessageResponse> sendMessage(
            @PathVariable String id,
            @Valid @RequestBody MessagingDtos.SendMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messagingService.sendMessage(id, request));
    }

    @PostMapping("/messaging/conversations/{id}/members")
    public MessagingDtos.ConversationResponse addMembers(
            @PathVariable String id,
            @Valid @RequestBody MessagingDtos.AddMemberRequest request) {
        return messagingService.addMembers(id, request);
    }

    @DeleteMapping("/messaging/conversations/{id}/members/{targetUserId}")
    public MessagingDtos.ConversationResponse removeMember(
            @PathVariable String id,
            @PathVariable String targetUserId,
            @RequestParam String userId) {
        return messagingService.removeMember(id, userId, targetUserId);
    }

    @PutMapping("/messaging/conversations/{id}")
    public MessagingDtos.ConversationResponse updateGroup(
            @PathVariable String id,
            @RequestParam String userId,
            @Valid @RequestBody MessagingDtos.UpdateGroupRequest request) {
        return messagingService.updateGroup(id, userId, request);
    }

    @PutMapping("/messaging/conversations/{id}/read")
    public void markAsRead(@PathVariable String id, @RequestParam String userId) {
        messagingService.markAsRead(id, userId);
    }

    // ── STOMP Message Mappings ────────────────────────────────

    @MessageMapping("/chat.send/{conversationId}")
    public void handleSendMessage(
            @DestinationVariable String conversationId,
            @Payload MessagingDtos.SendMessageRequest request) {
        messagingService.sendMessage(conversationId, request);
    }

    @MessageMapping("/chat.typing/{conversationId}")
    public void handleTyping(
            @DestinationVariable String conversationId,
            @Payload MessagingDtos.TypingEvent event) {
        messagingService.broadcastTyping(event);
    }
}
