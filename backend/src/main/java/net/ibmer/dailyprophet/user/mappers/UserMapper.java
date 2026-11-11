package net.ibmer.dailyprophet.user.mappers;

import net.ibmer.dailyprophet.house.mapper.HouseMapper;
import net.ibmer.dailyprophet.patronus.mapper.PatronusMapper;
import net.ibmer.dailyprophet.user.dto.UserFullResponse;
import net.ibmer.dailyprophet.user.dto.UserLeanResponse;
import net.ibmer.dailyprophet.user.models.Role;
import net.ibmer.dailyprophet.user.models.User;
import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.wand.mapper.WandMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserMapper {
    private final WandMapper wandMapper;
    private final PatronusMapper patronusMapper;
    private final HouseMapper houseMapper;

    // TODO: add post mapper after implementation
    // private final PostMapper postMapper;
    public UserFullResponse toUserFullResponse(User user) {
        return UserFullResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .imageUrl(user.getImageUrl())
                .accountLocked(user.getAccountLocked())
                .enabled(user.getEnabled())
                .roles(user.getRoles().stream().map(Role::getName).toList())
                .wand(wandMapper.toWandResponse(user.getWand()))
                .patronus(patronusMapper.toPatronusResponse(user.getPatronus()))
                .house(houseMapper.toHouseResponse(user.getHouse()))

                // TODO: add after implementation
                //.post(postMapper.toPostResponse(user.getPost()))

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


