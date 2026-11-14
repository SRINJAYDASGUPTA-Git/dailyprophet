package net.ibmer.dailyprophet.chat.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "direct_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DirectMessage {
    @Id
    private String id;
    private String senderUsername;
    private String recipientUsername;
    private String messageType; // e.g., "TEXT", "GIF", "STICKER"
    private String content; // Text, Emoji unicode, or GIF URL
    private LocalDateTime timestamp = LocalDateTime.now();
}