package org.avni.messaging.service;

import org.avni.messaging.contract.MessageRuleContract;
import org.avni.messaging.dao.MessageRuleRepository;
import org.avni.messaging.domain.MessageRule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessagingService {
    private static Logger logger = LoggerFactory.getLogger(MessagingService.class);

    private final MessageRuleRepository messageRuleRepository;

    @Autowired
    public MessagingService(MessageRuleRepository messageRuleRepository) {
        this.messageRuleRepository = messageRuleRepository;
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
}
