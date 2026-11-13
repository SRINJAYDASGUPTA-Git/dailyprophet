package net.ibmer.dailyprophet.comments.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.ibmer.dailyprophet.comments.dto.CommentRequest;
import net.ibmer.dailyprophet.comments.dto.CommentResponse;
import net.ibmer.dailyprophet.comments.mapper.CommentMapper;
import net.ibmer.dailyprophet.comments.models.Comment;
import net.ibmer.dailyprophet.comments.repositories.CommentRepository;
import net.ibmer.dailyprophet.exceptions.UnauthorizedAccessException;
import net.ibmer.dailyprophet.exceptions.UnauthorizedException;
import net.ibmer.dailyprophet.post.models.Post;
import net.ibmer.dailyprophet.post.repositories.PostRepository;
import net.ibmer.dailyprophet.shared.PageResponse;
import net.ibmer.dailyprophet.user.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentMapper commentMapper;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public PageResponse<CommentResponse> getCommentByPost (int size, int page, UUID postId){
        if (size < 1 || size > 20) {
            throw new IllegalArgumentException("Page size must be between 1 and 20");
        }
        Pageable pageable = PageRequest.of (page, size);
        Page<Comment> comments = commentRepository.findAllByPostIdAndParentCommentIsNull(pageable, postId);
        List<CommentResponse> commentResponses = comments.stream().map (commentMapper::toCommentResponse).toList ();

        return PageResponse.<CommentResponse>builder()
                .content (commentResponses)
                .size (size)
                .page (page)
                .first (comments.isFirst ())
                .last (comments.isLast ())
                .totalElements (comments.getTotalElements ())
                .totalPages (comments.getTotalPages ())
                .build();

    }

    public PageResponse<CommentResponse> getRepliesByParentComment (int size, int page, UUID parentCommentId){
        if (size < 1 || size > 20) {
            throw new IllegalArgumentException("Page size must be between 1 and 20");
        }
        Pageable pageable = PageRequest.of (page, size);
        Page<Comment> replies = commentRepository.findAllByParentComment_Id (parentCommentId, pageable);
        List<CommentResponse> replyResponses = replies.stream().map (commentMapper::toCommentResponse).toList ();

        return PageResponse.<CommentResponse>builder()
                .content (replyResponses)
                .size (size)
                .page (page)
                .first (replies.isFirst ())
                .last (replies.isLast ())
                .totalElements (replies.getTotalElements ())
                .totalPages (replies.getTotalPages ())
                .build();

    }

    public CommentResponse commentOnPost(Authentication connectedUser, CommentRequest commentRequest){
        User user = (User) connectedUser.getPrincipal ();
        if (user == null)
            throw new UnauthorizedException ("No Authenticated User");

        Post post = postRepository.findById (commentRequest.postId ()).orElseThrow (
                () -> new NoSuchElementException ("Post with id %s not found".formatted (commentRequest.postId()))
        );

        Comment comment = Comment.builder()
                .author (user)
                .post (post)
                .postId (commentRequest.postId ())
                .body (commentRequest.body ())
                .likes (0)
                .replyCount (0)
                .edited (false)
                .build();

        commentRepository.save (comment);

        return commentMapper.toCommentResponse (comment);
    }

    @Transactional
    public CommentResponse replyToComment(
            Authentication authentication,
            UUID parentCommentId,
            String body) {

        User user = (User) authentication.getPrincipal();

        Comment parent = commentRepository.findById(parentCommentId)
                .orElseThrow(() ->
                        new NoSuchElementException("Parent comment not found"));

        Comment reply = Comment.builder()
                .author(user)
                .post(parent.getPost())
                .parentComment(parent)
                .body(body)
                .likes(0)
                .replyCount(0)
                .edited(false)
                .build();

        commentRepository.save(reply);

        parent.setReplyCount(parent.getReplyCount() + 1);

        return commentMapper.toCommentResponse(reply);
    }

    public CommentResponse editComment(Authentication connectedUser, CommentRequest commentRequest){
        User user = (User) connectedUser.getPrincipal ();

        if (user == null)
            throw new UnauthorizedException ("No Authenticated User");

        Comment comment = commentRepository.findById (commentRequest.commentId ()).orElseThrow (
                () -> new NoSuchElementException ("Comment with id %s not found".formatted (commentRequest.commentId ()))
        );
        if (!user.getId().equals (comment.getAuthor ().getId ())){
            throw new UnauthorizedAccessException ("Editor not the author");
        }

        comment.setBody (commentRequest.body ());
        comment.setEdited (true);
        commentRepository.save (comment);

        return commentMapper.toCommentResponse (comment);
    }

    @Transactional
    public void likeComment(Authentication connectedUser, UUID commentId) {

        User user = (User) connectedUser.getPrincipal();

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new NoSuchElementException("Comment not found"));

        if (comment.getLikedBy().add(user)) {
            comment.setLikes(comment.getLikes() + 1);
        }
    }

    @Transactional
    public void unlikeComment(Authentication connectedUser, UUID commentId) {

        User user = (User) connectedUser.getPrincipal();
        if (user == null) {
            throw new UnauthorizedException("No Authenticated User");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new NoSuchElementException("Comment not found"));

        boolean removed = comment.getLikedBy()
                .removeIf(likedUser ->
                        likedUser.getId().equals(user.getId())
                );

        if (removed) {
            comment.setLikes (comment.getLikes () - 1);
            log.info("Comment unliked successfully: {}", commentId);
        } else {
            log.info("User had not liked this comment: {}", commentId);
        }

        commentRepository.save (comment);
    }

    public void deleteComment (Authentication connectedUser, UUID commentId){
        User user = (User) connectedUser.getPrincipal ();

        if (user == null)
            throw new UnauthorizedException ("No Authenticated User");

        Comment comment = commentRepository.findById (commentId).orElseThrow (
                () -> new NoSuchElementException ("Comment with id %s not found".formatted (commentId))
        );
        if (!user.equals (comment.getAuthor ())){
            throw new UnauthorizedException ("Remover not the author");
        }

        commentRepository.delete (comment);

    }
}
