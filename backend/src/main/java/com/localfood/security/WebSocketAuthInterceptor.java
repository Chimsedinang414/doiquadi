package com.localfood.security;

import com.localfood.model.ConversationMemberId;
import com.localfood.repository.ConversationMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Intercepts STOMP frames to:
 * <ol>
 *   <li><strong>CONNECT</strong> — authenticate the WebSocket session via JWT.
 *       The client must send the JWT access token in the {@code Authorization}
 *       STOMP header (value: {@code Bearer <token>}).</li>
 *   <li><strong>SUBSCRIBE</strong> — verify that the authenticated user is
 *       a member of the conversation they are subscribing to. This prevents
 *       users from reading messages of conversations they don't belong to.</li>
 * </ol>
 */
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final Pattern CONVERSATION_TOPIC_PATTERN =
            Pattern.compile("^/topic/conversation/([^/]+)(?:/.*)?$");

    private final JwtService jwtService;
    private final ConversationMemberRepository conversationMemberRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            authenticateConnection(accessor);
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            authorizeSubscription(accessor);
        }

        return message;
    }

    private void authenticateConnection(StompHeaderAccessor accessor) {
        String authorization = accessor.getFirstNativeHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            try {
                JwtService.TokenData token = jwtService.parseAccessToken(authorization.substring(7));
                var authorities = token.roles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .toList();
                var authentication = UsernamePasswordAuthenticationToken.authenticated(
                        token.subject(), token, authorities);
                accessor.setUser(authentication);
            } catch (RuntimeException ignored) {
                // Connection proceeds unauthenticated; subscribe guards will reject if needed.
            }
        }
    }

    /**
     * Rejects SUBSCRIBE to conversation topics when the user is not a member.
     * An unauthenticated user or a non-member will receive a
     * {@link org.springframework.messaging.MessageDeliveryException}.
     */
    private void authorizeSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) {
            return;
        }

        Matcher matcher = CONVERSATION_TOPIC_PATTERN.matcher(destination);
        if (!matcher.matches()) {
            // Not a conversation topic — allow freely (e.g. public topics).
            return;
        }

        String conversationId = matcher.group(1);
        java.security.Principal principal = accessor.getUser();
        if (principal == null) {
            throw new org.springframework.messaging.MessageDeliveryException(
                    "Authentication required to subscribe to conversation topics");
        }

        String userId = principal.getName();
        boolean isMember = conversationMemberRepository.existsById(
                new ConversationMemberId(conversationId, userId));

        if (!isMember) {
            throw new org.springframework.messaging.MessageDeliveryException(
                    "User is not a member of conversation " + conversationId);
        }
    }
}

