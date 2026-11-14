package net.ibmer.dailyprophet.user.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.exceptions.UnauthorizedException;
import net.ibmer.dailyprophet.house.models.House;
import net.ibmer.dailyprophet.house.repositories.HouseRepo;
import net.ibmer.dailyprophet.patronus.models.Patronus;
import net.ibmer.dailyprophet.patronus.repositories.PatronusRepo;
import net.ibmer.dailyprophet.user.dto.*;
import net.ibmer.dailyprophet.user.mappers.UserMapper;
import net.ibmer.dailyprophet.user.models.User;
import net.ibmer.dailyprophet.user.repositories.UserRepository;
import net.ibmer.dailyprophet.wand.models.Wand;
import net.ibmer.dailyprophet.wand.repositories.WandRepo;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserServices {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final HouseRepo houseRepository;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    private static final String PROFILE_URL = "https://www.harrypotter.com/profile/";
    private static final Pattern NEXT_DATA_PATTERN = Pattern.compile(
            "<script[^>]*id=[\"']__NEXT_DATA__[\"'][^>]*>([\\s\\S]*?)</script>",
            Pattern.CASE_INSENSITIVE
    );
    private final WandRepo wandRepo;
    private final PatronusRepo patronusRepo;

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

    public WizardingWorldProfile fetchWizardingWorldProfile(String uid) {
        String url = PROFILE_URL + URLEncoder.encode(uid, StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0");
        headers.set("Accept", "text/html");

        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, new HttpEntity<> (headers), String.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Profile request failed: HTTP " + response.getStatusCode());
        }

        Matcher matcher = NEXT_DATA_PATTERN.matcher(response.getBody());
        if (!matcher.find()) {
            throw new RuntimeException("Could not find __NEXT_DATA__ in the profile page.");
        }

        try {
            JsonNode nextData = objectMapper.readTree(matcher.group(1));
            JsonNode pageProps = nextData.path("props").path("pageProps");
            JsonNode profile = pageProps.path("publicUserData");

            if (profile.isMissingNode() || profile.isNull()) {
                throw new RuntimeException("No public profile data found for this UID.");
            }

            return normalizeProfile(uid, profile, pageProps);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse profile data: " + e.getMessage(), e);
        }
    }

    @Transactional
    public UserFullResponse linkWizardingWorldAccount(Authentication connectedUser, WizardingWorldProfile profile){
        User principalUser = (User) connectedUser.getPrincipal();

        if (principalUser == null){
            throw new UnauthorizedException("Please login");
        }

        User user = userRepository.findById(principalUser.getId()).orElseThrow(
                () -> new NoSuchElementException("User not found in database")
        );

        House house = houseRepository.findById (profile.house ()).orElseThrow (
                () -> new NoSuchElementException ("House not found")
        );

        Wand wand = wandRepo.findById (profile.wand ().imageKey ()+profile.wand ().core ()).orElseThrow (
                () -> new NoSuchElementException ("Wand Not Found")
        );

        Patronus patronus = patronusRepo.findById (profile.patronus ().name ()).orElseThrow (
                () -> new NoSuchElementException ("Patronus Not Found")
        );

        user.setHouse (house);
        user.setWand (wand);
        user.setPatronus (patronus);
        user.setImageUrl (profile.avatarUrl ());

        userRepository.save (user);

        return userMapper.toUserFullResponse (user);
    }

    private WizardingWorldProfile normalizeProfile(String uid, JsonNode profile, JsonNode pageProps) {
        JsonNode rootContent = pageProps.path("rootContent");
        JsonNode wandData = rootContent.path("wandData");
        JsonNode patronusImages = rootContent.path("patronusImages");
        JsonNode wand = profile.path("wand");

        String displayName = (profile.path("givenName").asText("") + " " + profile.path("familyName").asText("")).trim();
        String profileUrl = PROFILE_URL + URLEncoder.encode(uid, StandardCharsets.UTF_8);

        return new WizardingWorldProfile(
                uid,
                profileUrl,
                displayName.isEmpty() ? null : displayName,
                getTextOrNull(profile, "hogwartsHouse"),
                getTextOrNull(profile, "avatarUrl"),
                new PatronusDto (
                        getTextOrNull(profile, "patronusName"),
                        getPatronusImage(profile, patronusImages)
                ),
                extractWandData(wand, wandData)
        );
    }

    private WandDto extractWandData(JsonNode wand, JsonNode wandData) {
        String woodKey = getTextOrNull(wand, "wood");
        String coreKey = getTextOrNull(wand, "core");
        String lengthKey = getTextOrNull(wand, "length");
        String flexKey = getTextOrNull(wand, "flexibility");

        String woodTitle = getNestedText(wandData, "woodList", woodKey, "title", woodKey);
        String coreTitle = getNestedText(wandData, "coreList", coreKey, "title", coreKey);
        String lengthTitle = getNestedText(wandData, "lengthList", lengthKey, "title", lengthKey);
        String flexTitle = getNestedText(wandData, "flexibilityList", flexKey, "title", flexKey);

        String imageKey = null;
        String imageUrl = null;

        if (woodKey != null && lengthKey != null && flexKey != null) {
            String woodType = getNestedText(wandData, "woodList", woodKey, "type", null);
            String lengthType = getNestedText(wandData, "lengthList", lengthKey, "type", null);
            String flexType = getNestedText(wandData, "flexibilityList", flexKey, "type", null);

            if (woodType != null && lengthType != null && flexType != null) {
                imageKey = String.format("wand-%s-%s-%s_handle", woodType, lengthType, flexType);
                imageUrl = getNestedText(wandData, "images", imageKey, "displayImage", null);
            }
        }

        return new WandDto(woodTitle, coreTitle, lengthTitle, flexTitle, imageKey, imageUrl);
    }

    private String getPatronusImage(JsonNode profile, JsonNode patronusImages) {
        String filename = getTextOrNull(profile, "patronusFilename");
        if (filename != null && !patronusImages.isMissingNode()) {
            String target = filename.replace(".png", "");
            for (JsonNode item : patronusImages) {
                String logo = getTextOrNull(item, "roundDisplayLogo");
                if (logo != null && logo.contains(target)) return logo;
            }
        }

        String name = getTextOrNull(profile, "patronusName");
        if (name != null && !patronusImages.isMissingNode()) {
            String targetName = name.toLowerCase();
            for (JsonNode item : patronusImages) {
                String itemName = getTextOrNull(item, "name");
                if (itemName != null && itemName.toLowerCase().equals(targetName)) {
                    return getTextOrNull(item, "roundDisplayLogo");
                }
            }
        }
        return null;
    }

    private String getTextOrNull(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asText() : null;
    }

    private String getNestedText(JsonNode root, String list, String key, String field, String fallback) {
        if (key == null) return fallback;
        JsonNode target = root.path(list).path(key);
        return target.hasNonNull(field) ? target.get(field).asText() : fallback;
    }
}
