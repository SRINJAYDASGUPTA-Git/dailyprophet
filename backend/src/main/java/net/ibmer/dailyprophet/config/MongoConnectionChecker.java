package net.ibmer.dailyprophet.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.ibmer.dailyprophet.chat.models.DirectMessage; //[cite: 1]
import net.ibmer.dailyprophet.chat.repositories.DirectMessageRepository; //[cite: 1]
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MongoConnectionChecker implements CommandLineRunner {

    private final DirectMessageRepository dmRepository;
    @Override
    public void run(String... args) {
        log.info("Testing DirectMessage MongoDB CRUD operations...");

        try {
            // 1. Create a dummy message
            DirectMessage testMessage = new DirectMessage();

            // TODO: Populate your required fields based on your DirectMessage.java model
             testMessage.setSenderUsername ("test_sender_123");
             testMessage.setContent("Testing Mongo Integration!");

            // 2. Save to MongoDB
            DirectMessage savedMessage = dmRepository.save(testMessage);
            log.info("✅ Successfully saved test message! Assigned ID: {}", savedMessage.getId());

            // 3. Read back from MongoDB
            long count = dmRepository.count();
            log.info("✅ Total messages currently in the collection: {}", count);

            // 4. (Optional) Clean up so you don't pollute your dev database
            // dmRepository.delete(savedMessage);
            // logger.info("✅ Test message cleaned up.");

        } catch (Exception e) {
            log.error("❌ Failed to perform MongoDB CRUD operations!", e);
        }
    }
}