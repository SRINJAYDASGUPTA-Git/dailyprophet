package net.ibmer.dailyprophet.comments.controllers;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.comments.dto.CommentRequest;
import net.ibmer.dailyprophet.comments.dto.CommentResponse;
import net.ibmer.dailyprophet.comments.services.CommentService;
import net.ibmer.dailyprophet.shared.PageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/post/{postId}")
    public ResponseEntity<PageResponse<CommentResponse>> getCommentsByPost(
            @PathVariable UUID postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(commentService.getCommentByPost(size, page, postId));
    }

    @GetMapping("/{parentCommentId}/replies")
    public ResponseEntity<PageResponse<CommentResponse>> getReplies(
            @PathVariable UUID parentCommentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(commentService.getRepliesByParentComment(size, page, parentCommentId));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            Authentication authentication,
            @RequestBody CommentRequest commentRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.commentOnPost(authentication, commentRequest));
    }

    @PostMapping("/{parentCommentId}/replies")
    public ResponseEntity<CommentResponse> replyToComment(
            Authentication authentication,
            @PathVariable UUID parentCommentId,
            @RequestBody String body) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.replyToComment(authentication, parentCommentId, body));
    }

    @PutMapping
    public ResponseEntity<CommentResponse> editComment(
            Authentication authentication,
            @RequestBody CommentRequest commentRequest) {
        return ResponseEntity.ok(commentService.editComment(authentication, commentRequest));
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<Void> likeComment(
            Authentication authentication,
            @PathVariable UUID commentId) {
        commentService.likeComment(authentication, commentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{commentId}/unlike")
    public ResponseEntity<Void> unlikeComment(
            Authentication authentication,
            @PathVariable UUID commentId) {
        commentService.unlikeComment(authentication, commentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            Authentication authentication,
            @PathVariable UUID commentId) {
        commentService.deleteComment(authentication, commentId);
        return ResponseEntity.noContent().build();
    }
}