package net.ibmer.dailyprophet.comments.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.ibmer.dailyprophet.user.dto.UserLeanResponse;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {

    private UUID id;
    private UUID postId;

    private String body;
    private UserLeanResponse author;

    private Integer likes;
    private Integer replyCount;

    private Boolean edited;
    private LocalDateTime timestamp;
}
