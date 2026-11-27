package net.ibmer.dailyprophet.comments.dto;

import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CommentRequest(
        UUID commentId,
        UUID postId,
        @Size(max = 2000)
        String body
) {
}
