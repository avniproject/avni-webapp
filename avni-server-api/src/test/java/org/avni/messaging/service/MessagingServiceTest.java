package org.avni.messaging.service;

import org.avni.messaging.repository.MessageReceiverRepository;
import org.avni.messaging.repository.MessageRequestRepository;
import org.avni.messaging.repository.MessageRuleRepository;
import org.avni.messaging.domain.EntityType;
import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.domain.MessageRequestQueue;
import org.avni.messaging.domain.MessageRule;
import org.avni.server.service.RuleService;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class MessagingServiceTest {

    private MessagingService messagingService;

    @Mock
    private MessageRuleRepository messageRuleRepository;

    @Mock
    private MessageReceiverRepository messageReceiverRepository;

    @Mock
    private MessageRequestRepository messageRequestRepository;

    @Mock
    private RuleService ruleService;

    @Captor
    ArgumentCaptor<MessageReceiver> messageReceiver;

    @Captor
    ArgumentCaptor<MessageRequestQueue> messageRequest;

    @Before
    public void setup() {
        initMocks(this);
        messagingService = new MessagingService(messageRuleRepository, messageReceiverRepository, messageRequestRepository, ruleService);
    }

    @Test
    public void shouldSaveMessageRequestIfMessageRuleConfiguredOnSaveOfSubjectEntityType() {
        MessageRule messageRule = mock(MessageRule.class);
        Long subjectTypeId = 234L;
        Long individualId = 567l;
        when(messageRuleRepository.findMessageRuleByEntityTypeAndEntityTypeId(EntityType.Subject, subjectTypeId)).thenReturn(messageRule);

        String scheduleRule = "function(params, imports) { return {'scheduledDateTime': '2013-02-04 10:35:24'; }}";
        when(messageRule.getScheduleRule()).thenReturn(scheduleRule);
        Long messageRuleId = 123L;
        when(messageRule.getId()).thenReturn(messageRuleId);

        DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");
        DateTime scheduledDateTime = formatter.parseDateTime("2013-02-04 10:35:24");
        when(ruleService.executeScheduleRule(individualId, scheduleRule)).thenReturn(scheduledDateTime);

        messagingService.onEntityCreated(individualId, subjectTypeId);

        verify(messageReceiverRepository).save(messageReceiver.capture());
        MessageReceiver messageReceiver = this.messageReceiver.getValue();
        assertThat(messageReceiver.getEntityType()).isEqualTo(EntityType.Subject);
        assertThat(messageReceiver.getEntityId()).isEqualTo(individualId);
        assertThat(messageReceiver.getUuid()).isNotNull();

        verify(ruleService).executeScheduleRule(eq(individualId), eq(scheduleRule));
        verify(messageRequestRepository).save(messageRequest.capture());
        MessageRequestQueue messageRequest = this.messageRequest.getValue();
        assertThat(messageRequest.getMessageRuleId()).isEqualTo(messageRuleId);
        assertThat(messageRequest.getMessageReceiverId()).isEqualTo(messageReceiver.getId());
        assertThat(messageRequest.getScheduledDateTime()).isEqualTo(scheduledDateTime);
        assertThat(messageRequest.getUuid()).isNotNull();
    }
}
