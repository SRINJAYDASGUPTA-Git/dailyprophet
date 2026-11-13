package net.ibmer.dailyprophet.user.mappers;

import net.ibmer.dailyprophet.house.mapper.HouseMapper;
import net.ibmer.dailyprophet.patronus.mapper.PatronusMapper;
import net.ibmer.dailyprophet.post.mapper.PostMapper;
import net.ibmer.dailyprophet.user.dto.UserFullResponse;
import net.ibmer.dailyprophet.user.dto.UserLeanResponse;
import net.ibmer.dailyprophet.user.models.Role;
import net.ibmer.dailyprophet.user.models.User;
import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.wand.mapper.WandMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserMapper {
    private final WandMapper wandMapper;
    private final PatronusMapper patronusMapper;
    private final HouseMapper houseMapper;
    private final PostMapper postMapper;

    public UserFullResponse toUserFullResponse(User user) {
        return UserFullResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .imageUrl(user.getImageUrl())
                .accountLocked(user.getAccountLocked())
                .enabled(user.getEnabled())
                .roles(user.getRoles().stream().map(Role::getName).toList())

                .wand(user.getWand() != null ? wandMapper.toWandResponse(user.getWand()) : null)
                .patronus(user.getPatronus() != null ? patronusMapper.toPatronusResponse(user.getPatronus()) : null)
                .house(user.getHouse() != null ? houseMapper.toHouseResponse(user.getHouse()) : null)

                .posts(user.getPosts() != null ? user.getPosts().stream().map(postMapper::toPostResponse).toList() : List.of())
                .followers(!user.getFollowers().isEmpty() ? user.getFollowers().stream().map(this::toUserLeanResponse).collect(Collectors.toSet()) : Set.of())
                .following(!user.getFollowing().isEmpty() ? user.getFollowing().stream().map(this::toUserLeanResponse).collect(Collectors.toSet()) : Set.of())

                .build();
    }

    public UserLeanResponse toUserLeanResponse(User user) {
        return UserLeanResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .imageUrl(user.getImageUrl())
                .build();
    }

}


