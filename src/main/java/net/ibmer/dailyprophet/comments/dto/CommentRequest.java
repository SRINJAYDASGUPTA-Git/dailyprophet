package net.ibmer.dailyprophet.comments.dto;

import java.util.UUID;

public record CommentRequest(
        UUID postId,
        UUID authorId,
        String body
) {
}
