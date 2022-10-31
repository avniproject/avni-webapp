package org.avni.messaging.repository;

import org.avni.messaging.domain.MessageDeliveryStatus;
import org.avni.messaging.domain.MessageRequest;
import org.avni.server.dao.CHSRepository;
import org.springframework.stereotype.Repository;

import java.util.stream.Stream;

@Repository
public interface MessageRequestQueueRepository extends CHSRepository<MessageRequest> {

    Stream<MessageRequest> findAllByDeliveryStatus(MessageDeliveryStatus messageDeliveryStatus);

    default Stream<MessageRequest> findNotSentMessageRequests() {
        return findAllByDeliveryStatus(MessageDeliveryStatus.NotSent);
    }
}
