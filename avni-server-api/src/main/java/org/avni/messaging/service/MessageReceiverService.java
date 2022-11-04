package org.avni.messaging.service;

import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.domain.ReceiverType;
import org.avni.messaging.repository.GlificContactRepository;
import org.avni.messaging.repository.MessageReceiverRepository;
import org.avni.server.domain.Individual;
import org.avni.server.service.IndividualService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MessageReceiverService {

    private final MessageReceiverRepository messageReceiverRepository;

    private final GlificContactRepository glificContactRepository;

    private final IndividualService individualService;
    private static final Logger logger = LoggerFactory.getLogger(MessageReceiverService.class);

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

        Individual individual = individualService.findById(messageReceiver.getReceiverId());
        String phoneNumber = individualService.findPhoneNumber(individual);
        if (phoneNumber == null) {
            throw new PhoneNumberNotAvailableException();
        }

        String externalId = glificContactRepository.getOrCreateGlificContactId(phoneNumber, individual.getFullName());
        messageReceiver.setExternalId(externalId);
        return messageReceiverRepository.save(messageReceiver);
    }

    public void voidMessageReceiver(Long receiverId) {
        Optional<MessageReceiver> messageReceiver = getReceiverById(receiverId);

        messageReceiver.ifPresent(presentMessageReceiver -> {
            presentMessageReceiver.setVoided(true);
            messageReceiverRepository.save(presentMessageReceiver);
        });
    }

    public Optional<MessageReceiver> getReceiverById(Long receiverId) {
        return messageReceiverRepository.findById(receiverId);
    }
}
