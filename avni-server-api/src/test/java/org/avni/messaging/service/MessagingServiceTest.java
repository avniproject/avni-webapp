package org.avni.messaging.service;

import org.avni.messaging.domain.EntityType;
import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.domain.MessageRule;
import org.avni.messaging.domain.ReceiverEntityType;
import org.avni.messaging.repository.MessageRuleRepository;
import org.avni.server.service.RuleService;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;

import java.util.ArrayList;

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
    private RuleService ruleService;

    @Before
    public void setup() {
        initMocks(this);
        messagingService = new MessagingService(messageRuleRepository, messageReceiverService, messageRequestService, ruleService);
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
        when(ruleService.executeScheduleRule(individualId, scheduleRule)).thenReturn(scheduledDateTime);

        messagingService.onEntityCreateOrUpdate(individualId, subjectTypeId, EntityType.Subject, individualId);

        verify(messageReceiverService).saveReceiverIfRequired(eq(ReceiverEntityType.Subject), eq(individualId));
        verify(ruleService).executeScheduleRule(eq(individualId), eq(scheduleRule));
        verify(messageRequestService).createMessageRequest(messageRuleId, messageReceiverId, scheduledDateTime);
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
        when(ruleService.executeScheduleRule(individualId, scheduleRule)).thenReturn(scheduledDateTime);

        String scheduleRuleAnother = "scheduleRule2";
        when(messageRuleAnother.getScheduleRule()).thenReturn(scheduleRuleAnother);
        Long messageRuleAnotherId = 124L;
        when(messageRuleAnother.getId()).thenReturn(messageRuleAnotherId);

        DateTime scheduledDateTimeOfAnotherRule = formatter.parseDateTime("2019-02-04 10:35:24");
        when(ruleService.executeScheduleRule(individualId, scheduleRuleAnother)).thenReturn(scheduledDateTimeOfAnotherRule);

        messagingService.onEntityCreateOrUpdate(individualId, subjectTypeId, EntityType.Subject, individualId);

        verify(messageReceiverService, times(1)).saveReceiverIfRequired(eq(ReceiverEntityType.Subject), eq(individualId));
        verify(ruleService).executeScheduleRule(eq(individualId), eq(scheduleRule));
        verify(messageRequestService).createMessageRequest(messageRuleId, messageReceiverId, scheduledDateTime);

        verify(ruleService).executeScheduleRule(eq(individualId), eq(scheduleRuleAnother));
        verify(messageRequestService).createMessageRequest(messageRuleAnotherId, messageReceiverId, scheduledDateTimeOfAnotherRule);
    }
}
