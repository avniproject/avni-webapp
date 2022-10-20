package org.avni.messaging.service;

import org.avni.messaging.domain.*;
import org.avni.messaging.repository.GlificMessageRepository;
import org.avni.messaging.repository.MessageRequestQueueRepository;
import org.avni.messaging.repository.MessageRuleRepository;
import org.avni.server.service.RuleService;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;

import java.util.ArrayList;
import java.util.stream.Stream;

import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class MessagingServiceTest {

    private MessagingService messagingService;

    @Mock
    private MessageRuleRepository messageRuleRepository;

    @Mock
    private MessageReceiverService messageReceiverService;

    @Mock
    private MessageRequestService messageRequestService;

    @Mock
    private MessageRequestQueueRepository messageRequestQueueRepository;

    @Mock
    private RuleService ruleService;

    @Mock
    private GlificMessageRepository glificMessageRepository;

    @Mock
    private MessageReceiverService messageReceiverRepository;

    @Captor
    ArgumentCaptor<MessageReceiver> messageReceiver;

    @Captor
    ArgumentCaptor<MessageRequest> messageRequest;

    @Before
    public void setup() {
        initMocks(this);
        messagingService = new MessagingService(messageRuleRepository, messageReceiverRepository, messageRequestService, glificMessageRepository, messageRequestQueueRepository, ruleService);
    }

    @Test
    public void shouldSaveMessageRequestIfMessageRuleConfiguredOnSaveOfSubjectEntityType() {
        MessageRule messageRule = mock(MessageRule.class);
        ArrayList<MessageRule> messageRuleList = new ArrayList<MessageRule>() {
            {
                 add(messageRule);
            }
        };

        Long subjectTypeId = 234L;
        Long individualId = 567L;
        when(messageRuleRepository.findAllByEntityTypeAndEntityTypeId(EntityType.Subject, subjectTypeId)).thenReturn(messageRuleList);

        MessageReceiver messageReceiver = mock(MessageReceiver.class);
        when(messageReceiverService.saveReceiverIfRequired(ReceiverEntityType.Subject, individualId)).thenReturn(messageReceiver);
        Long messageReceiverId = 890L;
        when(messageReceiver.getId()).thenReturn(messageReceiverId);

        String scheduleRule = "function(params, imports) { return {'scheduledDateTime': '2013-02-04 10:35:24'; }}";
        when(messageRule.getScheduleRule()).thenReturn(scheduleRule);
        Long messageRuleId = 123L;
        when(messageRule.getId()).thenReturn(messageRuleId);

        DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");
        DateTime scheduledDateTime = formatter.parseDateTime("2013-02-04 10:35:24");
        when(ruleService.executeScheduleRule(messageRule.getEntityType().name(), individualId, scheduleRule)).thenReturn(scheduledDateTime);

        messagingService.onEntityCreateOrUpdate(individualId, subjectTypeId, EntityType.Subject, individualId);

        verify(messageReceiverService).saveReceiverIfRequired(eq(ReceiverEntityType.Subject), eq(individualId));
        verify(ruleService).executeScheduleRule(messageRule.getEntityType().name(), eq(individualId), eq(scheduleRule));
        verify(messageRequestService).createMessageRequest(messageRule, messageReceiver, scheduledDateTime);
    }

    @Test
    public void shouldSaveMessageRequestsForAllMessageRulesConfigured() {
        MessageRule messageRule = mock(MessageRule.class);
        MessageRule messageRuleAnother = mock(MessageRule.class);
        ArrayList<MessageRule> messageRuleList = new ArrayList<MessageRule>() {
            {
                 add(messageRule);
                 add(messageRuleAnother);
            }
        };

        Long subjectTypeId = 234L;
        Long individualId = 567L;
        when(messageRuleRepository.findAllByEntityTypeAndEntityTypeId(EntityType.Subject, subjectTypeId)).thenReturn(messageRuleList);

        MessageReceiver messageReceiver = mock(MessageReceiver.class);
        when(messageReceiverService.saveReceiverIfRequired(ReceiverEntityType.Subject, individualId)).thenReturn(messageReceiver);
        Long messageReceiverId = 890L;
        when(messageReceiver.getId()).thenReturn(messageReceiverId);

        String scheduleRule = "scheduleRule1";
        when(messageRule.getScheduleRule()).thenReturn(scheduleRule);
        Long messageRuleId = 123L;
        when(messageRule.getId()).thenReturn(messageRuleId);

        DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");
        DateTime scheduledDateTime = formatter.parseDateTime("2013-02-04 10:35:24");
        when(ruleService.executeScheduleRule(messageRule.getEntityType().name(), individualId, scheduleRule)).thenReturn(scheduledDateTime);

        String scheduleRuleAnother = "scheduleRule2";
        when(messageRuleAnother.getScheduleRule()).thenReturn(scheduleRuleAnother);
        Long messageRuleAnotherId = 124L;
        when(messageRuleAnother.getId()).thenReturn(messageRuleAnotherId);

        DateTime scheduledDateTimeOfAnotherRule = formatter.parseDateTime("2019-02-04 10:35:24");
        when(ruleService.executeScheduleRule(messageRule.getEntityType().name(), individualId, scheduleRuleAnother)).thenReturn(scheduledDateTimeOfAnotherRule);

        messagingService.onEntityCreateOrUpdate(individualId, subjectTypeId, EntityType.Subject, individualId);

        verify(messageReceiverService, times(1)).saveReceiverIfRequired(eq(ReceiverEntityType.Subject), eq(individualId));
        verify(ruleService).executeScheduleRule(messageRule.getEntityType().name(), eq(individualId), eq(scheduleRule));
        verify(messageRequestService).createMessageRequest(messageRule, messageReceiver, scheduledDateTime);

        verify(ruleService).executeScheduleRule(messageRule.getEntityType().name(), eq(individualId), eq(scheduleRuleAnother));
        verify(messageRequestService).createMessageRequest(messageRuleAnother, messageReceiver, scheduledDateTimeOfAnotherRule);
    }

    @Test
    public void shouldSendMessagesForAllNotSentMessages() {
        MessageRule messageRule = new MessageRule();
        messageRule.setId(10L);
        messageRule.setMessageRule("I am a message rule");
        messageRule.setMessageTemplateId("messageTemplateId");
        MessageReceiver messageReceiver = new MessageReceiver(ReceiverEntityType.Subject, 1L, "1234");
        MessageRequest request = new MessageRequest(messageRule, messageReceiver, DateTime.now());
        String[] parameters = new String[]{"someParam"};

        when(messageRequestQueueRepository.findNotSentMessageRequests()).thenReturn(Stream.<MessageRequest>builder().add(request).build());

        when(ruleService.executeMessageRule(request.getMessageReceiver().getEntityType().name(), request.getMessageReceiver().getEntityId(), messageRule.getMessageRule())).thenReturn(parameters);

        messagingService.sendMessages();

        verify(glificMessageRepository).sendMessage(messageRule.getMessageTemplateId(), messageReceiver.getExternalId(), parameters);
    }
}
