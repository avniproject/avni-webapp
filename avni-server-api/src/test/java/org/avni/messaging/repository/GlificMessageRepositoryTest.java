package org.avni.messaging.repository;

import org.avni.messaging.external.GlificRestClient;
import org.junit.Test;

import static org.junit.Assert.*;
import static org.mockito.Mockito.mock;

public class GlificMessageRepositoryTest {

    @Test
    public void shouldSendMessage() {
        GlificRestClient glificRestClient = mock(GlificRestClient.class);
        new GlificMessageRepository(glificRestClient).sendMessage("templateId", "1233", new String[]{"1", "2"});
    }
}