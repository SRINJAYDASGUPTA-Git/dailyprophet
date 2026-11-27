package net.ibmer.dailyprophet.post.dto;

import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record PostRequest(
        UUID postId,
        @Size(max = 5000)
        String caption,
        List<String> mediaUrls
) {
}