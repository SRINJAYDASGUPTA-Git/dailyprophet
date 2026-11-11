package net.ibmer.dailyprophet.comments.repositories;

import net.ibmer.dailyprophet.comments.models.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    Page<Comment> findAllByParentComment_Id(UUID parentCommentId,
                                            Pageable pageable);

    @Query  (value = """
SELECT * FROM comments c where c.post_id = :postId and c.parent_comment_id IS NULL
""", nativeQuery = true)
    Page<Comment> findAllByPostIdAndParentCommentIsNull(Pageable pageable, @Param ("postId") UUID postId);
}
