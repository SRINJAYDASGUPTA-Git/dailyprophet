package net.ibmer.dailyprophet.comments.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.ibmer.dailyprophet.post.models.Post;
import net.ibmer.dailyprophet.user.dto.UserLeanResponse;
import net.ibmer.dailyprophet.user.models.User;

import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class CommentResponse {
//    id
//    postId
//    authorUsername
//    authorImageUrl
//    likedBy
//    replies
    private UUID id;
    private UUID postId;
    private UserLeanResponse author;
    private List<UserLeanResponse> likedBy;
    private List<CommentResponse> replies;
}
