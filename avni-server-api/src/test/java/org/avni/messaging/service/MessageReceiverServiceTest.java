package org.avni.messaging.service;

import org.avni.messaging.domain.EntityType;
import org.avni.messaging.domain.MessageReceiver;
import org.avni.messaging.domain.ReceiverEntityType;
import org.avni.messaging.repository.MessageReceiverRepository;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class MessageReceiverServiceTest {

    private MessageReceiverService messageReceiverService;

    @Mock
    private MessageReceiverRepository messageReceiverRepository;

    @Captor
    ArgumentCaptor<MessageReceiver> messageReceiver;

    @Before
    public void setUp() throws Exception {
        initMocks(this);
        messageReceiverService = new MessageReceiverService(messageReceiverRepository);
    }

    @Test
    public void shouldSaveMessageReceiverIfNotExist() {
        Long entityId = 123L;
        when(messageReceiverRepository.findByEntityId(entityId)).thenReturn(null);

        MessageReceiver actualMessageReceiver = messageReceiverService.saveReceiverIfRequired(ReceiverEntityType.Subject, entityId);

        verify(messageReceiverRepository).save(messageReceiver.capture());

        MessageReceiver messageReceiver = this.messageReceiver.getValue();
        assertThat(messageReceiver.getEntityType()).isEqualTo(EntityType.Subject);
        assertThat(messageReceiver.getEntityId()).isEqualTo(entityId);
        assertThat(messageReceiver.getUuid()).isNotNull();
        assertThat(actualMessageReceiver).isEqualToComparingFieldByFieldRecursively(messageReceiver);
    }

    @Test
    public void shouldReturnExistingMessageReceiverIfExist() {
        Long entityId = 123L;
        MessageReceiver messageReceiver = mock(MessageReceiver.class);
        when(messageReceiverRepository.findByEntityId(entityId)).thenReturn(messageReceiver);

        MessageReceiver actualMessageReceiver = messageReceiverService.saveReceiverIfRequired(ReceiverEntityType.Subject, entityId);

        verify(messageReceiverRepository, never()).save(any());
        assertThat(actualMessageReceiver).isEqualTo(messageReceiver);
    }
}