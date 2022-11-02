package org.avni.messaging.service;

import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.domain.MessageRequest;
import org.avni.messaging.domain.MessageRule;
import org.avni.messaging.repository.MessageRequestQueueRepository;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MessageRequestService {
    private final MessageRequestQueueRepository messageRequestRepository;

    @Autowired
    public MessageRequestService(MessageRequestQueueRepository messageRequestRepository) {
        this.messageRequestRepository = messageRequestRepository;
    }

    public MessageRequest createMessageRequest(MessageRule messageRule, MessageReceiver messageReceiver, Long entityId, DateTime scheduledDateTime) {
        MessageRequest messageRequest = messageRequestRepository.findByMessageReceiverAndMessageRule(
                messageReceiver, messageRule)
                .orElse(new MessageRequest(messageRule, messageReceiver, entityId, scheduledDateTime));
        if (messageRequest.isDelivered()) {
            return messageRequest;
        }
        messageRequest.setScheduledDateTime(scheduledDateTime);
        messageRequest.assignUUIDIfRequired();
        return messageRequestRepository.save(messageRequest);
    }

    public MessageRequest markComplete(MessageRequest messageRequest) {
        messageRequest.markComplete();
        return messageRequestRepository.save(messageRequest);
    }

    public void deleteMessageRequests(MessageRule messageRule, MessageReceiver messageReceiver) {
        Optional<MessageRequest> messageRequest = messageRequestRepository.findByMessageReceiverAndMessageRule(
                messageReceiver, messageRule);
        messageRequest.ifPresent(presentMessageRequest -> {
            presentMessageRequest.setVoided(true);
            messageRequestRepository.save(presentMessageRequest);
        });
    }
}
