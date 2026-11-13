package net.ibmer.dailyprophet.user.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.ibmer.dailyprophet.exceptions.UnauthorizedException;
import net.ibmer.dailyprophet.user.dto.UserFullResponse;
import net.ibmer.dailyprophet.user.dto.UserUpdateRequest;
import net.ibmer.dailyprophet.user.mappers.UserMapper;
import net.ibmer.dailyprophet.user.models.User;
import net.ibmer.dailyprophet.user.repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServices {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional
    public UserFullResponse getCurrentUser(Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        if(user == null){
            throw new UnauthorizedException("Login Please");
        }
        //        log.info(response.toString());
        return userMapper.toUserFullResponse(user);
    }

    public UserFullResponse updateCurrentUser(Authentication connectedUser, UserUpdateRequest request) {
        User user = (User) connectedUser.getPrincipal();
        if(user == null){
            throw new UnauthorizedException("Login Please");
        }

        if (request.name() != null) {
            user.setName(request.name());
        }
        if (request.imageUrl() != null) {
            user.setImageUrl(request.imageUrl());
        }
        userRepository.save(user);
        return userMapper.toUserFullResponse(user);
    }


    @Transactional
    public void followUser(Authentication connectedUser, UUID toFollow){
        User me = (User) connectedUser.getPrincipal();

        if(me == null){
            throw new UnauthorizedException("Login Please");
        }

        User toFollowUser = userRepository.findById(toFollow).orElseThrow(()-> new NoSuchElementException("User Not Found"));

        if(toFollowUser.getFollowers().add(me)){
            userRepository.save(toFollowUser);
        }

        if(me.getFollowing().add(toFollowUser)){
            userRepository.save(me);
        }
    }

    @Transactional
    public void removeFollower(Authentication connectedUser, UUID toRemove) {
        User me = (User) connectedUser.getPrincipal();

        if(me == null){
            throw new UnauthorizedException("Login Please");
        }

        User toRemoveUser = userRepository.findById(toRemove).orElseThrow(()-> new NoSuchElementException("User Not Found"));

        if(toRemoveUser.getFollowing().remove(me)){
            userRepository.save(toRemoveUser);
        }

        if(me.getFollowers().remove(toRemoveUser)){
            userRepository.save(me);
        }
    }

    @Transactional
    public void unfollowUser(Authentication connectedUser, UUID toRemove) {
        User me = (User) connectedUser.getPrincipal();

        if(me == null){
            throw new UnauthorizedException("Login Please");
        }

        User toRemoveUser = userRepository.findById(toRemove).orElseThrow(()-> new NoSuchElementException("User Not Found"));

        if(toRemoveUser.getFollowers().remove(me)){
            userRepository.save(toRemoveUser);
        }

        if(me.getFollowing().remove(toRemoveUser)){
            userRepository.save(me);
        }
    }

}
