package net.ibmer.dailyprophet.post.repositories;

import net.ibmer.dailyprophet.post.models.Post;
import net.ibmer.dailyprophet.user.models.User;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {
    Page<Post> findAllByOwner(Pageable pageable, User owner);

    Optional<Post> findById(@NonNull UUID id);

    Page<Post> findAllByIsArchivedAndIsDeleted(boolean b, boolean b1, Pageable pageable);

    Optional<Post> findByIsArchivedAndIsDeletedAndId(boolean b, boolean b1, UUID postId);

    Page<Post> findAllByOwnerAndIsArchivedAndIsDeleted(User owner, Boolean isArchived, Boolean isDeleted, Pageable pageable);

    Optional<Post> findByIdAndIsDeleted(UUID id, Boolean isDeleted);
}
