package net.ibmer.dailyprophet.post.dto;

import java.util.List;
import java.util.UUID;

public record PostRequest(
        UUID postId,
        String caption,
        List<String> mediaUrls
) {
}