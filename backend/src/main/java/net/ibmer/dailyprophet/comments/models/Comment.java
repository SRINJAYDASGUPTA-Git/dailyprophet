package net.ibmer.dailyprophet.comments.models;

import jakarta.persistence.*;
import lombok.*;
import net.ibmer.dailyprophet.post.models.Post;
import net.ibmer.dailyprophet.user.models.User;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String body;
    private Integer likes;
    private Integer replyCount;
    private Boolean edited;

    @Column(name = "post_id", insertable = false, updatable = false)
    private UUID postId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToMany
    @Builder.Default
    private Set<User> likedBy = new HashSet<> ();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

    @OneToMany(mappedBy = "parentComment")
    private List<Comment> replies = new ArrayList<> ();

}
