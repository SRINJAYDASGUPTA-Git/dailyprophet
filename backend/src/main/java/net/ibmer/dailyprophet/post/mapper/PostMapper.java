package net.ibmer.dailyprophet.post.mapper;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.post.dto.PostResponse;
import net.ibmer.dailyprophet.post.models.Post;
import net.ibmer.dailyprophet.user.mappers.UserMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostMapper {
    private final UserMapper userMapper;

    public PostResponse toPostResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .caption(post.getCaption())
                .timestamp(post.getTimestamp())
                .owner(userMapper.toUserLeanResponse(post.getOwner()))
                .likesCount(post.getLikedBy().size())
                .mediaUrls(post.getMediaUrls())
                .commentsCount(post.getComment().size())
                .sharesCount(post.getSharedBy().size())
                .savesCount(post.getSavedBy().size())
                .build();
    }
}