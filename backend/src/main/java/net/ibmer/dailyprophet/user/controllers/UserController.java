package net.ibmer.dailyprophet.user.controllers;

import net.ibmer.dailyprophet.user.dto.UserFullResponse;
import net.ibmer.dailyprophet.user.dto.UserUpdateRequest;
import net.ibmer.dailyprophet.user.dto.VerifyWWAccessRequest;
import net.ibmer.dailyprophet.user.dto.WizardingWorldProfile;
import net.ibmer.dailyprophet.user.services.UserServices;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.user.services.UsernameBloomFilterService;
import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for managing user profiles and information")
public class UserController {

    private final UserServices userService;
    private final UsernameBloomFilterService bloomFilterService;
//    private static final Pattern UID_PATTERN = Pattern.compile("^[0-9a-fA-F-]{36}$");
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

    @GetMapping("/{userId}")
    public ResponseEntity<UserFullResponse> getUserById(
            @PathVariable(value = "userId") UUID userId
    ){
        return ResponseEntity.ok (userService.findById(userId));
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

    @GetMapping("/wizarding-world-profile")
    public ResponseEntity<?> getWizardingWorldProfile(@RequestParam("uid") String uid) {
        String trimmedUid = uid != null ? uid.trim() : "";

//        if (!UID_PATTERN.matcher(trimmedUid).matches()) {
//            return ResponseEntity.badRequest ().body (Map.of ("error", "Enter a valid profile UID."));
//        }
        WizardingWorldProfile profile = userService.fetchWizardingWorldProfile(trimmedUid);
        return ResponseEntity.ok(profile);
    }

    @PostMapping ("/verify-ww-access")
    public ResponseEntity<?> verifyUserHasAccessToWWProfile(@RequestBody VerifyWWAccessRequest request) throws BadRequestException {
        String trimmedUid = request.uid () != null ? request.uid ().trim() : "";
        System.out.println ("=======================================================");
        System.out.println ("SERVICE FUNCTION START");
        System.out.println ("=======================================================");

        System.out.println ("UID: "+ request.uid ());
        System.out.println ("Old Name: "+ request.oldName ());
        System.out.println ("Unicode character "+ request.specialCharUnicode ());
        WizardingWorldProfile newProfile = userService.fetchWizardingWorldProfile(trimmedUid);

        System.out.println("------------------------------------------------");

        System.out.println("Fetched New Profile: ");

        System.out.println("------------------------------------------------");

        System.out.printf ("UID: %s\n Name: %s\n House: %s\n", newProfile.uid (), newProfile.name (), newProfile.house ());

        int splCharCodePoint = Integer.parseInt(request.specialCharUnicode ().replaceFirst("(?i)^U\\+", ""), 16);
        int firstCharCodePoint = newProfile.name ().codePointAt(0);

        System.out.printf ("Special Char Codepoint: %d\t First Char Codepoint: %d", splCharCodePoint, firstCharCodePoint);

        if((splCharCodePoint != firstCharCodePoint) || newProfile.name ().equals (request.oldName ())){
            return ResponseEntity
                    .status (HttpStatus.FORBIDDEN)
                    .body(Map.of ("message", "Cannot Verify Authority"));
        }

        return ResponseEntity.accepted ().build ();
    }

    @GetMapping("/link-ww-profile")
    public ResponseEntity<UserFullResponse> linkWizardingWorldProfile(
            Authentication connectedUser,
            @RequestParam("uid") String uid
    ) {
        String trimmedUid = uid != null ? uid.trim() : "";

//        if (!UID_PATTERN.matcher(trimmedUid).matches()) {
//            throw new BadRequestException ("Invalid UID");
//        }
        WizardingWorldProfile profile = userService.fetchWizardingWorldProfile (trimmedUid);

        return ResponseEntity.ok(userService.linkWizardingWorldAccount (connectedUser, profile));
    }

    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Boolean>> checkUsernameAvailability(@RequestParam String username) {
        // Returns true if taken (or likely taken), false if definitely free
        boolean isTaken = bloomFilterService.isUsernameTaken(username);
        return ResponseEntity.ok(Map.of("usernameAvailable", !isTaken)); // Return true if available
    }
}


