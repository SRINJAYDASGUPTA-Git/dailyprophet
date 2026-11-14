package net.ibmer.dailyprophet.chat.controllers;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.chat.models.DirectMessage;
import net.ibmer.dailyprophet.chat.repositories.DirectMessageRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/messages") // Standard REST base URL for history
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final DirectMessageRepository messageRepository;

    // STOMP endpoint for sending real-time messages
    // Frontend sends to: /app/chat.send
    @MessageMapping("/chat.send")
    public void processMessage(@Payload DirectMessage chatMessage) {
        DirectMessage savedMsg = messageRepository.save(chatMessage);

        messagingTemplate.convertAndSendToUser(
                chatMessage.getRecipientUsername(),
                "/queue/messages",
                savedMsg
        );
    }

    // REST endpoint to load chat history when opening a DM
    @GetMapping("/{sender}/{recipient}")
    public List<DirectMessage> getChatHistory(@PathVariable String sender, @PathVariable String recipient) {
        return messageRepository.findBySenderUsernameAndRecipientUsernameOrderByTimestampAsc(sender, recipient);
    }
}