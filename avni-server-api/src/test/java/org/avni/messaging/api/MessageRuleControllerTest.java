package org.avni.messaging.api;

import org.avni.messaging.service.MessagingService;
import org.junit.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.ArrayList;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class MessageRuleControllerTest {

    @Test
    public void shouldGetAllIfEntityTypeNotProvided() {
        MessagingService messagingService = mock(MessagingService.class);
        when(messagingService.findAll(any())).thenReturn(new PageImpl<>(new ArrayList<>()));
        MessageRuleController messageRuleController = new MessageRuleController(messagingService);
        messageRuleController.find(null, null, PageRequest.of(0,10));

        verify(messagingService).findAll(any());
    }

    @Test (expected = IllegalArgumentException.class)
    public void shouldThrowErrorForNonExistentEntityType() {
        MessageRuleController messageRuleController = new MessageRuleController(null);
        messageRuleController.find("Non existent entity type", "5", PageRequest.of(0,10));
    }
}