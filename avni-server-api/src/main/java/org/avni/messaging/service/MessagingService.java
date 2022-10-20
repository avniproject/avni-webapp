package org.avni.messaging.service;

import org.avni.messaging.domain.EntityType;
import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.domain.MessageRule;
import org.avni.messaging.domain.ReceiverEntityType;
import org.avni.messaging.repository.MessageRuleRepository;
import org.avni.server.service.RuleService;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessagingService {
    private static final Logger logger = LoggerFactory.getLogger(MessagingService.class);

    private final MessageRuleRepository messageRuleRepository;
    private final MessageReceiverService messageReceiverService;
    private final MessageRequestService messageRequestService;
    private final RuleService ruleService;

    @Autowired
    public MessagingService(MessageRuleRepository messageRuleRepository, MessageReceiverService messageReceiverService, MessageRequestService messageRequestService, RuleService ruleService) {
        this.messageRuleRepository = messageRuleRepository;
        this.messageReceiverService = messageReceiverService;
        this.messageRequestService = messageRequestService;
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

    public void onEntityCreated(Long entityId, Long entityTypeId, EntityType entityType) {
        List<MessageRule> messageRules = messageRuleRepository.findAllByEntityTypeAndEntityTypeId(entityType, entityTypeId);
        MessageReceiver messageReceiver = messageReceiverService.saveReceiverIfRequired(ReceiverEntityType.Subject, entityId);

        for (MessageRule messageRule : messageRules) {
            DateTime scheduledDateTime = ruleService.executeScheduleRule(entityId, messageRule.getScheduleRule());
            messageRequestService.createMessageRequest(messageRule.getId(), messageReceiver.getId(), scheduledDateTime);
        }
    }

    public Page<MessageRule> findByEntityTypeAndEntityTypeId(EntityType entityType, String entityTypeId, Pageable pageable) {
        return messageRuleRepository.findByEntityTypeAndEntityTypeId(entityType, entityTypeId, pageable);
    }
}
