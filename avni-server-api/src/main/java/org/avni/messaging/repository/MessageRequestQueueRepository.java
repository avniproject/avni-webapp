package org.avni.messaging.repository;

import org.avni.messaging.domain.MessageDeliveryStatus;
import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.domain.MessageRequest;
import org.avni.messaging.domain.MessageRule;
import org.avni.server.dao.CHSRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.stream.Stream;

@Repository
public interface MessageRequestQueueRepository extends CHSRepository<MessageRequest> {

    Stream<MessageRequest> findAllByDeliveryStatusAndIsVoidedFalse(MessageDeliveryStatus messageDeliveryStatus);

    Optional<MessageRequest> findByEntityIdAndMessageRule(Long entityId, MessageRule messageRule);

    default Stream<MessageRequest> findNotSentMessageRequests() {
        return findAllByDeliveryStatusAndIsVoidedFalse(MessageDeliveryStatus.NotSent);
    }

    @Modifying(clearAutomatically = true, flushAutomatically=true)
    @Query(value = "update message_request_queue mr set " +
            "is_voided = :isVoided " +
            "where mr.entity_id = :entityId", nativeQuery = true)
    void updateVoided(boolean isVoided, Long entityId);
}
