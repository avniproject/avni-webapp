package org.avni.messaging.service;

import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.domain.MessageRequest;
import org.avni.messaging.domain.MessageRule;
import org.avni.messaging.repository.MessageRequestQueueRepository;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.MockitoAnnotations.initMocks;

public class MessageRequestServiceTest {
    @Mock
    private MessageRequestQueueRepository messageRequestRepository;

    @Captor
    ArgumentCaptor<MessageRequest> messageRequest;

    private MessageRequestService messageRequestService;

    @Before
    public void setUp() throws Exception {
        initMocks(this);
        messageRequestService = new MessageRequestService(messageRequestRepository);
    }

    @Test
    public void shouldSaveMessageRequest() {
        MessageRule messageRule = new MessageRule();
        MessageReceiver messageReceiver = new MessageReceiver();
        DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");
        DateTime scheduledDateTime = formatter.parseDateTime("2013-02-04 10:35:24");

        messageRequestService.createMessageRequest(messageRule, messageReceiver, 1L, scheduledDateTime);

        verify(messageRequestRepository).save(messageRequest.capture());
        MessageRequest messageRequest = this.messageRequest.getValue();
        assertThat(messageRequest.getMessageRule()).isEqualTo(messageRule);
        assertThat(messageRequest.getMessageReceiver()).isEqualTo(messageReceiver);
        assertThat(messageRequest.getScheduledDateTime()).isEqualTo(scheduledDateTime);
        assertThat(messageRequest.getEntityId()).isEqualTo(1L);
        assertThat(messageRequest.getUuid()).isNotNull();
    }
}
