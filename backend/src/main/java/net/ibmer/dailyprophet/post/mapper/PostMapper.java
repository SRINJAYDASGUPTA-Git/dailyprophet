package net.ibmer.dailyprophet.post.mapper;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.post.dto.PostResponse;
import net.ibmer.dailyprophet.post.models.Post;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostMapper {

    public PostResponse toPostResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .caption(post.getCaption())
                .timestamp(post.getTimestamp())
                .isArchived(post.getIsArchived())
                .isDeleted(post.getIsDeleted())
                .ownerId(post.getOwner().getId ())
                .likesCount(post.getLikedBy() != null ? post.getLikedBy().size() : 0)
                .mediaUrls(post.getMediaUrls())
                .commentsCount(post.getComment() != null ? post.getComment().size() : 0)
                .sharesCount(post.getSharedBy() != null ? post.getSharedBy().size() : 0)
                .savesCount(post.getSavedBy() != null ? post.getSavedBy().size() : 0)
                .build();
    }
}