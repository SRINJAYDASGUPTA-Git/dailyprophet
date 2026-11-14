package net.ibmer.dailyprophet.chat.repositories;

import net.ibmer.dailyprophet.chat.models.DirectMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DirectMessageRepository extends MongoRepository<DirectMessage, String> {
    List<DirectMessage> findBySenderUsernameAndRecipientUsernameOrderByTimestampAsc(String sender, String recipient);
}