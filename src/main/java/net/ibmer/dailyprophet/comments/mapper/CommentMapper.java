package net.ibmer.dailyprophet.comments.mapper;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.comments.dto.CommentResponse;
import net.ibmer.dailyprophet.comments.models.Comment;
import net.ibmer.dailyprophet.user.mappers.UserMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentMapper {
    private final UserMapper userMapper;

    public CommentResponse toCommentResponse(Comment comment){
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .author(userMapper.toUserLeanResponse(comment.getAuthor()))
                .body (comment.getBody ())
                .edited (comment.getEdited ())
                .timestamp (comment.getTimestamp ())
                .likes(comment.getLikes())
                .replyCount (comment.getReplyCount ())
                .build();
    }
}
