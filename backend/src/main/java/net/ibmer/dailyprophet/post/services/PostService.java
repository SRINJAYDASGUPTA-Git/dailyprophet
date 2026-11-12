package net.ibmer.dailyprophet.post.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.ibmer.dailyprophet.exceptions.UnauthorizedException;
import net.ibmer.dailyprophet.post.dto.PostRequest;
import net.ibmer.dailyprophet.post.dto.PostResponse;
import net.ibmer.dailyprophet.post.mapper.PostMapper;
import net.ibmer.dailyprophet.post.models.Post;
import net.ibmer.dailyprophet.post.repositories.PostRepository;
import net.ibmer.dailyprophet.shared.PageResponse;
import net.ibmer.dailyprophet.user.models.User;
import net.ibmer.dailyprophet.user.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {
//    getAllPosts
//    getPostById
//    getAllPostByUser

//    getAllArchivedPosts
//    getAllPostsByMe

//    createPost
//    editPost
//    deletePost
//
//    likePost
//    unlikePost
//    savePost
//    unsavePost

    private final PostRepository postRepository;
    private final PostMapper postMapper;
    private final UserRepository userRepository;

    private PageResponse<PostResponse> getPostResponsePageResponse(int page, int size, User user, Boolean isArchived) {
        if (size <1 || size > 20)
            throw new IllegalArgumentException("Size should be between 1 and 20");

        Pageable pageable = PageRequest.of(page, size);

        Page<Post> posts= postRepository.findAllByOwnerAndIsArchivedAndIsDeleted(user, isArchived, false, pageable);

        List<PostResponse> postResponses = posts.stream().map(postMapper::toPostResponse).toList();

        return PageResponse.<PostResponse>builder()
                .content(postResponses)
                .size(size)
                .page(page)
                .first(posts.isFirst())
                .last(posts.isLast())
                .totalElements(posts.getTotalElements())
                .totalPages(posts.getTotalPages())
                .build();
    }

    public PageResponse<PostResponse> getAllPosts(int page, int size ){
        if (size < 1 || size > 50) {
            throw new IllegalArgumentException("Page size must be between 1 and 50");
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<Post> posts = postRepository.findAllByIsArchivedAndIsDeleted(false, false, pageable);
        List<PostResponse> postResponses = posts.stream().map(postMapper::toPostResponse).toList();

        return PageResponse.<PostResponse>builder()
                .content(postResponses)
                .size(size)
                .page(page)
                .first(posts.isFirst())
                .last(posts.isLast())
                .totalElements(posts.getTotalElements())
                .totalPages(posts.getTotalPages())
                .build();
    }

    public PostResponse getPostById(UUID postId){
        Post post = postRepository.findByIsArchivedAndIsDeletedAndId(false, false, postId).orElseThrow(()-> new NoSuchElementException("No Such Element exists."));
        return postMapper.toPostResponse(post);
    }

    public PageResponse<PostResponse> getAllPostsByUser(UUID userId, int page, int size){
        User user = userRepository.findById(userId).orElseThrow(()-> new NoSuchElementException("User Not Found"));

        return getPostResponsePageResponse(page, size, user, false);
    }

    public PageResponse<PostResponse> getAllPostsByMe(Authentication connectedUser, int page, int size){
        User user = (User) connectedUser.getPrincipal();

        if (user == null){
            throw new UnauthorizedException("No Authenticated User");
        }

        return getPostResponsePageResponse(page, size, user, false);
    }

    public PageResponse<PostResponse> getAllArchivedPosts(Authentication connectedUser, int page, int size){
        User user = (User) connectedUser.getPrincipal();

        if (user == null){
            throw new UnauthorizedException("No Authenticated User");
        }

        return getPostResponsePageResponse(page, size, user, true);
    }

    public PostResponse createPost(Authentication connectedUser, PostRequest postRequest){
        User user = (User) connectedUser.getPrincipal();

        if (user == null){
            throw new UnauthorizedException("No Authenticated User");
        }

        Post post = Post.builder()
                .mediaUrls(postRequest.mediaUrls())
                .caption(postRequest.caption() != null ? postRequest.caption() : "")
                .timestamp(LocalDateTime.now())
                .isArchived(false)
                .isDeleted(false)
                .owner(user)
                .build();

        post = postRepository.save(post);

        return postMapper.toPostResponse(post);
    }

    public PostResponse editPost(Authentication authentication, PostRequest postRequest) {
        User user = (User) authentication.getPrincipal();
        if (user == null) {
            throw new UnauthorizedException("No Authenticated User");
        }

        Post post = postRepository.findByIdAndIsDeleted(postRequest.postId(), false)
                .orElseThrow(() -> new NoSuchElementException("Post with id %s not found".formatted(postRequest.postId())));

        if (!post.getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("Editor is not the author of this post");
        }

        if (postRequest.caption() != null) {
            post.setCaption(postRequest.caption());
        }
        if (postRequest.mediaUrls() != null) {
            post.setMediaUrls(postRequest.mediaUrls());
        }

        post = postRepository.save(post);
        return postMapper.toPostResponse(post);
    }

    public void deletePost(Authentication authentication, UUID postId) {

        User user = (User) authentication.getPrincipal();
        if (user == null) {
            throw new UnauthorizedException("No Authenticated User");
        }

        Post post = postRepository.findByIdAndIsDeleted(postId, false)
                .orElseThrow(() -> new NoSuchElementException("Post with id %s not found".formatted(postId)));

        if (!post.getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("Remover is not the author of this post");
        }

        postRepository.delete(post);
      }

    @Transactional
    public void likePost(Authentication authentication, UUID postId) {
        User user = (User) authentication.getPrincipal();
        if (user == null) {
            throw new UnauthorizedException("No Authenticated User");
        }

        Post post = postRepository.findByIsArchivedAndIsDeletedAndId(false, false, postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));

        if (!post.getLikedBy().contains(user)) {
            post.getLikedBy().add(user);
            postRepository.save(post);
        }
    }

    @Transactional
    public void unlikePost(Authentication authentication, UUID postId) {
        log.info("Starting Unlike: {}", postId);
        User user = (User) authentication.getPrincipal();
        if (user == null) {
            throw new UnauthorizedException("No Authenticated User");
        }

        log.info("User Verified: {}", user.getName());

        Post post = postRepository.findByIsArchivedAndIsDeletedAndId(false, false, postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));

        log.info("Post Found, postId={}, postLikes={}", post.getId(), post.getLikedBy().toString());
        if (post.getLikedBy().contains(user)) {
            post.getLikedBy().remove(user);
            postRepository.save(post);
        }
        log.info("Post Unliked, postId={}, postLikes={}", post.getId(), post.getLikedBy().toString());

    }

    @Transactional
    public void savePost(Authentication authentication, UUID postId) {
        User user = (User) authentication.getPrincipal();
        if (user == null) {
            throw new UnauthorizedException("No Authenticated User");
        }

        Post post = postRepository.findByIsArchivedAndIsDeletedAndId(false, false, postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));

        if (!post.getSavedBy().contains(user)) {
            post.getSavedBy().add(user);
            postRepository.save(post);
        }
    }

    @Transactional
    public void unsavePost(Authentication authentication, UUID postId) {
        User user = (User) authentication.getPrincipal();
        if (user == null) {
            throw new UnauthorizedException("No Authenticated User");
        }

        Post post = postRepository.findByIsArchivedAndIsDeletedAndId(false, false, postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));

        if (post.getSavedBy().remove(user)) {
            postRepository.save(post);
        }
    }
}
