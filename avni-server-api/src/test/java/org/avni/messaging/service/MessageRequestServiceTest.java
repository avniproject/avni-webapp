package org.avni.messaging.service;

import org.avni.messaging.domain.MessageRequestQueue;
import org.avni.messaging.repository.MessageRequestRepository;
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
    private MessageRequestRepository messageRequestRepository;

    @Captor
    ArgumentCaptor<MessageRequestQueue> messageRequest;

    private MessageRequestService messageRequestService;

    @Before
    public void setUp() throws Exception {
        initMocks(this);
        messageRequestService = new MessageRequestService(messageRequestRepository);
    }

    @Test
    public void shouldSaveMessageRequest() {
        Long messageRuleId = 12L;
        Long messageReceiverId = 34L;
        DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");
        DateTime scheduledDateTime = formatter.parseDateTime("2013-02-04 10:35:24");

        messageRequestService.createMessageRequest(messageRuleId, messageReceiverId, scheduledDateTime);

        verify(messageRequestRepository).save(messageRequest.capture());
        MessageRequestQueue messageRequest = this.messageRequest.getValue();
        assertThat(messageRequest.getMessageRuleId()).isEqualTo(messageRuleId);
        assertThat(messageRequest.getMessageReceiverId()).isEqualTo(messageReceiverId);
        assertThat(messageRequest.getScheduledDateTime()).isEqualTo(scheduledDateTime);
        assertThat(messageRequest.getUuid()).isNotNull();
    }
}
