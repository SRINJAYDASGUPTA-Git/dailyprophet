package net.ibmer.dailyprophet.user.services;

import com.google.common.hash.BloomFilter;
import com.google.common.hash.Funnels;
import net.ibmer.dailyprophet.user.models.User;
import net.ibmer.dailyprophet.user.repositories.UserRepository;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class UsernameBloomFilterService {

    private BloomFilter<String> usernameFilter;
    private final UserRepository userRepository;

    public UsernameBloomFilterService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void init() {
        // Expected elements: 100,000 (adjust based on expected user base)
        // False positive probability: 1% (0.01)
        usernameFilter = BloomFilter.create(
                Funnels.stringFunnel(StandardCharsets.UTF_8),
                100_000,
                0.01
        );

        // Load existing usernames from MongoDB on startup
        List<User> users = userRepository.findAll(); // Assuming you have findAll()
        for (User user : users) {
            // Replace getUsername() with your actual getter (e.g., getEmail() or getWizardName())
            if (user.getUsername() != null) {
                usernameFilter.put(user.getUsername().toLowerCase());
            }
        }
        System.out.println("Bloom Filter initialized with " + users.size() + " usernames.");
    }

    /**
     * Checks if a username might be taken.
     * @return true if it MIGHT be taken, false if it is DEFINITELY available.
     */
    public boolean isUsernameTaken(String username) {
        if (username == null || username.trim().isEmpty()) return true;
        return usernameFilter.mightContain(username.toLowerCase());
    }

    /**
     * Adds a newly registered username to the filter.
     */
    public void addUsername(String username) {
        if (username != null) {
            usernameFilter.put(username.toLowerCase());
        }
    }
}