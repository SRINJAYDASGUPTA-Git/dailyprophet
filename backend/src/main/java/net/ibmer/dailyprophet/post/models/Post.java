package net.ibmer.dailyprophet.post.models;

import com.mongodb.lang.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.ibmer.dailyprophet.comments.models.Comment;
import net.ibmer.dailyprophet.user.models.User;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
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
    private List<User> sharedBy;

    @ManyToMany
    private List<User> savedBy;

    @ManyToMany
    private List<User> likedBy;

    @ManyToOne
    private User owner;
}
