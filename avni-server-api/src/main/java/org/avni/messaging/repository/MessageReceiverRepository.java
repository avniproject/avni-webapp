package org.avni.messaging.repository;

import org.avni.messaging.domain.MessageReceiver;
import org.avni.server.dao.CHSRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageReceiverRepository  extends CHSRepository<MessageReceiver> {
    MessageReceiver findByReceiverId(Long receiverId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "update message_receiver mr set " +
            "is_voided = :isVoided " +
            "where mr.receiver_id = :receiverId", nativeQuery = true)
    void updateVoided(boolean isVoided, Long receiverId);
}
