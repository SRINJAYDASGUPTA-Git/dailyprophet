package net.ibmer.dailyprophet.comments.dto;

import java.util.UUID;

public record CommentRequest(
        UUID commentId,
        UUID postId,
        String body
) {
}
