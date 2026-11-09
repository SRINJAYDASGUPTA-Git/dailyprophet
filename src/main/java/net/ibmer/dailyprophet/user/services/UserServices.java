package net.ibmer.dailyprophet.user.services;

import net.ibmer.dailyprophet.user.dto.UserFullResponse;
import net.ibmer.dailyprophet.user.dto.UserUpdateRequest;
import net.ibmer.dailyprophet.user.mappers.UserMapper;
import net.ibmer.dailyprophet.user.models.User;
import net.ibmer.dailyprophet.user.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServices {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional
    public UserFullResponse getCurrentUser(Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        //        log.info(response.toString());
        return userMapper.toUserFullResponse(user);
    }

    public UserFullResponse updateCurrentUser(Authentication connectedUser, UserUpdateRequest request) {
        User user = (User) connectedUser.getPrincipal();
        if (request.name() != null) {
            user.setName(request.name());
        }
        if (request.imageUrl() != null) {
            user.setImageUrl(request.imageUrl());
        }
        userRepository.save(user);
        return userMapper.toUserFullResponse(user);
    }

}
