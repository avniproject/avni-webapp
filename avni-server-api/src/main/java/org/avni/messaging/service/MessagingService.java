package org.avni.messaging.service;

import jdk.nashorn.api.scripting.JSObject;
import org.avni.messaging.dao.MessageReceiverRepository;
import org.avni.messaging.dao.MessageRequestRepository;
import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.dao.MessageRuleRepository;
import org.avni.messaging.domain.EntityType;
import org.avni.messaging.domain.MessageRequest;
import org.avni.messaging.domain.MessageRule;
import org.avni.server.domain.Individual;
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
    private static Logger logger = LoggerFactory.getLogger(MessagingService.class);

    private final MessageRuleRepository messageRuleRepository;
    private MessageReceiverRepository messageReceiverRepository;
    private MessageRequestRepository messageRequestRepository;

    @Autowired
    public MessagingService(MessageRuleRepository messageRuleRepository, MessageReceiverRepository messageReceiverRepository, MessageRequestRepository messageRequestRepository) {
        this.messageRuleRepository = messageRuleRepository;
        this.messageReceiverRepository = messageReceiverRepository;
        this.messageRequestRepository = messageRequestRepository;
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

        DateTime scheduledDateTime = evaluateScheduleRule(messageRule);
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
}
