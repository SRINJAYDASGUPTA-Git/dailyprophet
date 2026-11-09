package net.ibmer.dailyprophet.comments.mapper;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.comments.dto.CommentResponse;
import net.ibmer.dailyprophet.comments.models.Comment;
import net.ibmer.dailyprophet.user.mappers.UserMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentMapper {
    private UserMapper userMapper;

    public CommentResponse toCommentResponse(Comment comment){
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .author(userMapper.toUserLeanResponse(comment.getAuthor()))
                .likedBy(
                        comment.getLikedBy().stream().map(userMapper::toUserLeanResponse).toList()
                )
                //.replies()
                .build();
    }
}
