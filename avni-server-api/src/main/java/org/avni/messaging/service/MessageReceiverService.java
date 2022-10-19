package org.avni.messaging.service;

import org.avni.messaging.domain.EntityType;
import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.repository.MessageReceiverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MessageReceiverService {

    private final MessageReceiverRepository messageReceiverRepository;

    @Autowired
    public MessageReceiverService(MessageReceiverRepository messageReceiverRepository) {
        this.messageReceiverRepository = messageReceiverRepository;
    }

    public MessageReceiver saveReceiverIfRequired(EntityType entityType, Long entityId) {
        MessageReceiver messageReceiver = messageReceiverRepository.findByEntityId(entityId);
        if (messageReceiver == null) {
            messageReceiver = new MessageReceiver(entityType, entityId);
            messageReceiver.assignUUIDIfRequired();
            messageReceiverRepository.save(messageReceiver);
        }

        return messageReceiver;
    }
}
