package org.avni.messaging.service;

import org.avni.messaging.domain.MessageRequestQueue;
import org.avni.messaging.repository.MessageRequestRepository;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MessageRequestService {
    private final MessageRequestRepository messageRequestRepository;

    @Autowired
    public MessageRequestService(MessageRequestRepository messageRequestRepository) {
        this.messageRequestRepository = messageRequestRepository;
    }

    public void createMessageRequest(Long messageRuleId, Long messageReceiverId, DateTime scheduledDateTime) {
        MessageRequestQueue messageRequestQueue = new MessageRequestQueue(messageRuleId, messageReceiverId, scheduledDateTime);
        messageRequestQueue.assignUUIDIfRequired();
        messageRequestRepository.save(messageRequestQueue);
    }
}
