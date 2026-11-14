package net.ibmer.dailyprophet.config;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.security.JWTService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JWTService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        if (accessor != null &&
                StompCommand.CONNECT.equals(accessor.getCommand())) {

            String authorization = accessor.getFirstNativeHeader(
                    "Authorization"
            );

            if (authorization == null ||
                    !authorization.startsWith("Bearer ")) {
                throw new AccessDeniedException (
                        "Missing WebSocket authentication token"
                );
            }

            String token = authorization.substring(7);
            String user_email = jwtService.extractClaim (token, "user_email", String.class);
            UserDetails userDetails =
                    userDetailsService.loadUserByUsername(user_email);

            if (!jwtService.isAccessTokenValid (token, user_email)) {
                throw new AccessDeniedException(
                        "Invalid WebSocket authentication token"
                );
            }

            Authentication authentication =
                    new UsernamePasswordAuthenticationToken (
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            accessor.setUser(authentication);
        }

        return message;
    }
}
