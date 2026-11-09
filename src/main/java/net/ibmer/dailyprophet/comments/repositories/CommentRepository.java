package net.ibmer.dailyprophet.comments.repositories;

import net.ibmer.dailyprophet.comments.models.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
}
