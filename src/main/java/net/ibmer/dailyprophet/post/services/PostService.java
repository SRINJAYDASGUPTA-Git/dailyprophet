package net.ibmer.dailyprophet.post.services;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.exceptions.UnauthorizedException;
import net.ibmer.dailyprophet.post.dto.PostRequest;
import net.ibmer.dailyprophet.post.dto.PostResponse;
import net.ibmer.dailyprophet.post.mapper.PostMapper;
import net.ibmer.dailyprophet.post.models.Post;
import net.ibmer.dailyprophet.post.repositories.PostRepository;
import net.ibmer.dailyprophet.shared.PageResponse;
import net.ibmer.dailyprophet.user.models.User;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {
//    getAllPosts
//    getPostById
//    getAllPostByUser
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

    public PageResponse<PostResponse> getAllPosts(int page, int size ){
        if (size < 1 || size > 50) {
            throw new IllegalArgumentException("Page size must be between 1 and 50");
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<Post> posts = postRepository.findAll(pageable);
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
        Post post = postRepository.findById(postId).orElseThrow(()-> new NoSuchElementException("No Such Element exists."));
        return postMapper.toPostResponse(post);
    }

    public PageResponse<>

    public PostResponse createPost(Authentication connectedUser, PostRequest postRequest){
        User user = (User) connectedUser.getPrincipal();    //??

        if (user == null){
            throw new UnauthorizedException("No Authenticated User");
        }

        Post post
    }
}
