package org.avni.messaging.service;

import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.domain.MessageRequest;
import org.avni.messaging.domain.MessageRule;
import org.avni.messaging.repository.MessageRequestQueueRepository;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MessageRequestService {
    private final MessageRequestQueueRepository messageRequestRepository;

    @Autowired
    public MessageRequestService(MessageRequestQueueRepository messageRequestRepository) {
        this.messageRequestRepository = messageRequestRepository;
    }

    public MessageRequest createMessageRequest(MessageRule messageRule, MessageReceiver messageReceiver, DateTime scheduledDateTime) {
        MessageRequest messageRequest = new MessageRequest(messageRule, messageReceiver, scheduledDateTime);
        messageRequest.assignUUIDIfRequired();
        messageRequestRepository.save(messageRequest);
        return messageRequest;
    }

    public MessageRequest markComplete(MessageRequest messageRequest) {
        messageRequest.markComplete();
        messageRequestRepository.save(messageRequest);
        return messageRequest;
    }
}
