package net.ibmer.dailyprophet.post.controllers;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.post.dto.PostRequest;
import net.ibmer.dailyprophet.post.dto.PostResponse;
import net.ibmer.dailyprophet.post.services.PostService;
import net.ibmer.dailyprophet.shared.PageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<PageResponse<PostResponse>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getAllPosts(page, size));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable UUID postId) {
        return ResponseEntity.ok(postService.getPostById(postId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<PageResponse<PostResponse>> getAllPostByUser(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size

    ){
        return ResponseEntity.ok(postService.getAllPostsByUser(userId, page, size));
    }

    @GetMapping("/me")
    public ResponseEntity<PageResponse<PostResponse>> getAllPostsByMe(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        return ResponseEntity.ok(postService.getAllPostsByMe(authentication, page, size));
    }

    @GetMapping("/archived")
    public ResponseEntity<PageResponse<PostResponse>> getAllArchivedPosts(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        return ResponseEntity.ok(postService.getAllArchivedPosts(authentication, page, size));
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            Authentication authentication,
            @RequestBody PostRequest postRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.createPost(authentication, postRequest));
    }

    @PutMapping
    public ResponseEntity<PostResponse> editPost(
            Authentication authentication,
            @RequestBody PostRequest postRequest) {
        return ResponseEntity.ok(postService.editPost(authentication, postRequest));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            Authentication authentication,
            @PathVariable UUID postId) {
        postService.deletePost(authentication, postId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<Void> likePost(
            Authentication authentication,
            @PathVariable UUID postId) {
        postService.likePost(authentication, postId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{postId}/unlike")
    public ResponseEntity<Void> unlikePost(
            Authentication authentication,
            @PathVariable UUID postId) {
        postService.unlikePost(authentication, postId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{postId}/save")
    public ResponseEntity<Void> savePost(
            Authentication authentication,
            @PathVariable UUID postId) {
        postService.savePost(authentication, postId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{postId}/unsave")
    public ResponseEntity<Void> unsavePost(
            Authentication authentication,
            @PathVariable UUID postId) {
        postService.unsavePost(authentication, postId);
        return ResponseEntity.ok().build();
    }
}