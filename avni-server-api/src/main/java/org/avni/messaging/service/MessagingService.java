package org.avni.messaging.service;

import org.avni.messaging.repository.MessageReceiverRepository;
import org.avni.messaging.repository.MessageRequestRepository;
import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.repository.MessageRuleRepository;
import org.avni.messaging.domain.EntityType;
import org.avni.messaging.domain.MessageRequestQueue;
import org.avni.messaging.domain.MessageRule;
import org.avni.server.service.RuleService;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessagingService {
    private static final Logger logger = LoggerFactory.getLogger(MessagingService.class);

    private final MessageRuleRepository messageRuleRepository;
    private final MessageReceiverRepository messageReceiverRepository;
    private final MessageRequestRepository messageRequestRepository;
    private final RuleService ruleService;

    @Autowired
    public MessagingService(MessageRuleRepository messageRuleRepository, MessageReceiverRepository messageReceiverRepository, MessageRequestRepository messageRequestRepository, RuleService ruleService) {
        this.messageRuleRepository = messageRuleRepository;
        this.messageReceiverRepository = messageReceiverRepository;
        this.messageRequestRepository = messageRequestRepository;
        this.ruleService = ruleService;
    }

    @Transactional
    public MessageRule find(Long id) {
        return messageRuleRepository.findEntity(id);
    }

    @Transactional
    public MessageRule find(String uuid) {
        return messageRuleRepository.findByUuid(uuid);
    }

    @Transactional
    public MessageRule saveRule(MessageRule messageRule) {
        return messageRuleRepository.save(messageRule);
    }

    @Transactional
    public MessageRule findByIdOrUuid(Long id, String uuid) {
        return uuid != null ? find(uuid) : find(id);
    }

    @Transactional
    public Page<MessageRule> findAll(Pageable pageable) {
        return messageRuleRepository.findAll(pageable);
    }

    @Transactional
    public void onEntityCreated(Long entityId, Long entityTypeId) {
        MessageRule messageRule = messageRuleRepository.findMessageRuleByEntityTypeAndEntityTypeId(EntityType.Subject, entityTypeId);
        MessageReceiver messageReceiver = new MessageReceiver(EntityType.Subject, entityId);
        messageReceiver.assignUUIDIfRequired();
        messageReceiverRepository.save(messageReceiver);

        DateTime scheduledDateTime = ruleService.executeScheduleRule(entityId, messageRule.getScheduleRule());

        MessageRequestQueue messageRequestQueue = new MessageRequestQueue(messageRule.getId(), messageReceiver.getId(), scheduledDateTime);
        messageRequestQueue.assignUUIDIfRequired();
        messageRequestRepository.save(messageRequestQueue);
    }

    public Page<MessageRule> findByEntityTypeAndEntityTypeId(EntityType entityType, String entityTypeId, Pageable pageable) {
        return messageRuleRepository.findByEntityTypeAndEntityTypeId(entityType, entityTypeId, pageable);
    }
}
