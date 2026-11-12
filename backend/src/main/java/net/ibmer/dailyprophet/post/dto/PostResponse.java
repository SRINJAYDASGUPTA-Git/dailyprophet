package net.ibmer.dailyprophet.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.ibmer.dailyprophet.user.dto.UserLeanResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private UUID id;
    private String caption;
    private LocalDateTime timestamp;
    private UserLeanResponse owner;
    private Boolean isDeleted;
    private Boolean isArchived;

    private Integer likesCount;
    private Integer commentsCount;
    private Integer sharesCount;
    private Integer savesCount;

    private List<String> mediaUrls;
}