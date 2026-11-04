package net.ibmer.dailyprophet.user.mappers;

import net.ibmer.dailyprophet.user.dto.UserResponse;
import net.ibmer.dailyprophet.user.models.Role;
import net.ibmer.dailyprophet.user.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserMapper {
    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .imageUrl(user.getImageUrl())
                .accountLocked(user.getAccountLocked())
                .enabled(user.getEnabled())
                .roles(user.getRoles().stream().map(Role::getName).toList())
                .build();
    }
}
