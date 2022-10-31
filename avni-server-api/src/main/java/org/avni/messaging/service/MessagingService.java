package org.avni.messaging.service;

import org.avni.messaging.domain.*;
import org.avni.messaging.repository.GlificMessageRepository;
import org.avni.messaging.repository.MessageRequestQueueRepository;
import org.avni.messaging.repository.MessageRuleRepository;
import org.avni.server.service.RuleService;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Stream;

@Service
public class MessagingService {
    private static final Logger logger = LoggerFactory.getLogger(MessagingService.class);

    private final MessageRuleRepository messageRuleRepository;
    private final MessageReceiverService messageReceiverService;
    private final MessageRequestService messageRequestService;
    private GlificMessageRepository glificMessageRepository;
    private final RuleService ruleService;
    private MessageRequestQueueRepository messageRequestQueueRepository;

    @Autowired
    public MessagingService(MessageRuleRepository messageRuleRepository, MessageReceiverService messageReceiverService,
                            MessageRequestService messageRequestService, GlificMessageRepository glificMessageRepository, MessageRequestQueueRepository messageRequestQueueRepository, RuleService ruleService) {
        this.messageRuleRepository = messageRuleRepository;
        this.messageReceiverService = messageReceiverService;
        this.messageRequestService = messageRequestService;
        this.glificMessageRepository = glificMessageRepository;
        this.messageRequestQueueRepository = messageRequestQueueRepository;
        this.ruleService = ruleService;
    }

    public MessageRule find(Long id) {
        return messageRuleRepository.findEntity(id);
    }

    public MessageRule find(String uuid) {
        return messageRuleRepository.findByUuid(uuid);
    }

    public MessageRule saveRule(MessageRule messageRule) {
        return messageRuleRepository.save(messageRule);
    }

    public MessageRule findByIdOrUuid(Long id, String uuid) {
        return uuid != null ? find(uuid) : find(id);
    }

    public Page<MessageRule> findAll(Pageable pageable) {
        return messageRuleRepository.findAll(pageable);
    }

    public void onEntitySave(Long entityId, Long entityTypeId, EntityType entityType, Long receiverId) {
        List<MessageRule> messageRules = messageRuleRepository.findAllByEntityTypeAndEntityTypeId(entityType, entityTypeId);
        MessageReceiver messageReceiver = messageReceiverService.saveReceiverIfRequired(ReceiverType.Subject, receiverId);

        for (MessageRule messageRule : messageRules) {
            DateTime scheduledDateTime = ruleService.executeScheduleRule(messageRule.getEntityType().name(), entityId, messageRule.getScheduleRule());
            messageRequestService.createMessageRequest(messageRule, messageReceiver, entityId, scheduledDateTime);
        }
    }

    public void onEntityDelete(Long entityId, Long entityTypeId, EntityType entityType, Long receiverId) {
        List<MessageRule> messageRules = messageRuleRepository.findAllByEntityTypeAndEntityTypeId(entityType, entityTypeId);
        MessageReceiver messageReceiver = messageReceiverService.saveReceiverIfRequired(ReceiverType.Subject, receiverId);

        for (MessageRule messageRule : messageRules) {
            messageRequestService.deleteMessageRequests(messageRule, messageReceiver);
        }
    }


    @Transactional
    public Page<MessageRule> findByEntityTypeAndEntityTypeId(EntityType entityType, String entityTypeId, Pageable pageable) {
        return messageRuleRepository.findByEntityTypeAndEntityTypeId(entityType, entityTypeId, pageable);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public MessageRequest sendMessage(MessageRequest messageRequest) {
        logger.debug(String.format("Sending message for %d", messageRequest.getId()));
        sendMessageToGlific(messageRequest);
        messageRequest = messageRequestService.markComplete(messageRequest);
        logger.debug(String.format("Sent message for %d", messageRequest.getId()));
        return messageRequest;
    }

    @Transactional
    public void sendMessages() {
        Stream<MessageRequest> requests = messageRequestQueueRepository.findNotSentMessageRequests();
        requests.forEach(this::sendMessage);
    }

    private void sendMessageToGlific(MessageRequest messageRequest) {
        MessageReceiver messageReceiver = messageRequest.getMessageReceiver();
        MessageRule messageRule = messageRequest.getMessageRule();
        String[] response = ruleService.executeMessageRule(messageRule.getEntityType().name(), messageRequest.getEntityId(), messageRule.getMessageRule());
        messageReceiverService.ensureExternalIdPresent(messageReceiver);
        glificMessageRepository.sendMessage(messageRule.getMessageTemplateId(), messageReceiver.getExternalId(), response);
    }
}
