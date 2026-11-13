package net.ibmer.dailyprophet.user.controllers;

import net.ibmer.dailyprophet.user.dto.UserFullResponse;
import net.ibmer.dailyprophet.user.dto.UserUpdateRequest;
import net.ibmer.dailyprophet.user.services.UserServices;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for managing user profiles and information")
public class UserController {

    private final UserServices userService;
//    private final AuthenticationService authenticationService;

    @GetMapping("/me")
    @Operation(
            summary = "Get Current User",
            description = "Returns the details of the currently authenticated user."
    )
    public ResponseEntity<UserFullResponse> getCurrentUser(Authentication connectedUser) {
        return ResponseEntity.ok(userService.getCurrentUser(connectedUser));
    }

    @PutMapping("/me")
    @Operation(
            summary = "Update Current User",
            description = "Updates the details of the currently authenticated user. The request body should contain the updated user information."
    )
    public ResponseEntity<UserFullResponse> updateCurrentUser(Authentication connectedUser, @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateCurrentUser(connectedUser, request));
    }

    @PostMapping("/follow/{userId}")
    @Operation(
            summary = "Follow a User"
    )
    public ResponseEntity<Void> followUser(
            Authentication connectedUser,
            @PathVariable UUID userId
    )
    {
        userService.followUser(connectedUser, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/follower/{userId}")
    @Operation(
            summary = "Remove a Follower"
    )
    public ResponseEntity<Void> removeFollower(
            Authentication connectedUser,
            @PathVariable UUID userId
    )
    {
        userService.removeFollower(connectedUser, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unfollow/{userId}")
    @Operation(
            summary = "Unfollow a User"
    )
    public ResponseEntity<Void> unfollowUser(
            Authentication connectedUser,
            @PathVariable UUID userId
    )
    {
        userService.unfollowUser(connectedUser, userId);
        return ResponseEntity.ok().build();
    }
}


