package org.avni.messaging.service;

import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.domain.ReceiverType;
import org.avni.messaging.repository.GlificContactRepository;
import org.avni.messaging.repository.MessageReceiverRepository;
import org.avni.server.service.IndividualService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MessageReceiverService {

    private final MessageReceiverRepository messageReceiverRepository;

    private final GlificContactRepository glificContactRepository;

    private final IndividualService individualService;

    @Autowired
    public MessageReceiverService(MessageReceiverRepository messageReceiverRepository, GlificContactRepository glificContactRepository, IndividualService individualService) {
        this.messageReceiverRepository = messageReceiverRepository;
        this.glificContactRepository = glificContactRepository;
        this.individualService = individualService;
    }

    public MessageReceiver saveReceiverIfRequired(ReceiverType entityType, Long entityId) {
        MessageReceiver messageReceiver = messageReceiverRepository.findByReceiverId(entityId);
        if (messageReceiver == null) {
            messageReceiver = new MessageReceiver(entityType, entityId, null);
            messageReceiver.assignUUIDIfRequired();
            messageReceiverRepository.save(messageReceiver);
        }

        return messageReceiver;
    }

    public MessageReceiver ensureExternalIdPresent(MessageReceiver messageReceiver) {
        if (messageReceiver.getExternalId() != null) {
            return messageReceiver;
        }
        String externalId = glificContactRepository.getOrCreateGlificContactId(individualService.findPhoneNumber(messageReceiver.getReceiverId()));
        messageReceiver.setExternalId(externalId);
        return messageReceiverRepository.save(messageReceiver);
    }
}
