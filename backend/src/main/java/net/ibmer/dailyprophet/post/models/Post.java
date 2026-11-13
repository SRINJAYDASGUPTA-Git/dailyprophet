package net.ibmer.dailyprophet.post.models;

import com.mongodb.lang.Nullable;
import jakarta.persistence.*;
import lombok.*;
import net.ibmer.dailyprophet.comments.models.Comment;
import net.ibmer.dailyprophet.user.models.User;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private List<String> mediaUrls;
    private Boolean isDeleted;
    private Boolean isArchived;

    @Nullable
    private String caption;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;

    @OneToMany(mappedBy = "post")
    private List<Comment> comment;

    @ManyToMany
    private Set<User> sharedBy= new HashSet<>();

    @ManyToMany
    private Set<User> savedBy= new HashSet<>();

    @ManyToMany
    private Set<User> likedBy= new HashSet<>();

    @ManyToOne
    private User owner;
}
