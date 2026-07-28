package com.localfood.security;

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

/**
 * Intercepts STOMP CONNECT frames to authenticate the WebSocket session via JWT.
 * The client must send the JWT access token in the {@code Authorization} STOMP header
 * (value: {@code Bearer <token>}).
 */
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
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
        return message;
    }
}
