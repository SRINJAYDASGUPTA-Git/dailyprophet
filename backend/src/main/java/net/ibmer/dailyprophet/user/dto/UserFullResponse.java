package net.ibmer.dailyprophet.user.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.ToString;
import net.ibmer.dailyprophet.house.dto.HouseResponse;
import net.ibmer.dailyprophet.patronus.dto.PatronusResponse;
import net.ibmer.dailyprophet.post.dto.PostResponse;
import net.ibmer.dailyprophet.post.models.Post;
import net.ibmer.dailyprophet.wand.dto.WandResponse;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Builder
@Data
@AllArgsConstructor
@ToString
public class UserFullResponse {
    private UUID id;
    private String name;
    private String email;
    private String imageUrl;
    private Boolean accountLocked;
    private Boolean enabled;
    private List<String> roles;

    private List<PostResponse> posts;
    private Set<UserLeanResponse> followers, following;

    private WandResponse wand;
    private PatronusResponse patronus;
    private HouseResponse house;
}
