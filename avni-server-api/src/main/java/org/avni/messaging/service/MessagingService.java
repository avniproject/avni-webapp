package org.avni.messaging.service;

import jdk.nashorn.api.scripting.JSObject;
import org.avni.messaging.repository.MessageReceiverRepository;
import org.avni.messaging.repository.MessageRequestRepository;
import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.repository.MessageRuleRepository;
import org.avni.messaging.domain.EntityType;
import org.avni.messaging.domain.MessageRequest;
import org.avni.messaging.domain.MessageRule;
import org.avni.server.domain.Individual;
import org.avni.server.service.RuleService;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

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
    public void saveMessageFor(Individual individual) {
        MessageRule messageRule = messageRuleRepository.findMessageRuleByEntityTypeAndEntityTypeId(EntityType.Subject, individual.getLegacyId());
        MessageReceiver messageReceiver = new MessageReceiver(EntityType.Subject, individual.getLegacyId());
        messageReceiverRepository.save(messageReceiver);

        DateTime scheduledDateTime = ruleService.executeScheduleRule(individual, messageRule.getScheduleRule());

        MessageRequest messageRequest = new MessageRequest(messageRule.getId(), messageReceiver.getId(), scheduledDateTime);
        messageRequestRepository.save(messageRequest);
    }

    private static DateTime evaluateScheduleRule(MessageRule messageRule) {
        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine engine = manager.getEngineByName("js");
        DateTime scheduledDateTime = new DateTime();
        try {
            JSObject scheduleRuleFunction = (JSObject) engine.eval(messageRule.getScheduleRule());
            JSONObject arguments = new JSONObject();
            arguments.put("params", "");
            arguments.put("imports", "");

            String scheduledDateTimeString = (String) scheduleRuleFunction.call(null, arguments);
            DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");
            scheduledDateTime = formatter.parseDateTime(scheduledDateTimeString);
        } catch (ScriptException e) {
            throw new RuntimeException(e);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
        return scheduledDateTime;
    }

    public Page<MessageRule> findByEntityTypeAndEntityTypeId(EntityType entityType, String entityTypeId, Pageable pageable) {
        return messageRuleRepository.findByEntityTypeAndEntityTypeId(entityType, entityTypeId, pageable);
    }
}
