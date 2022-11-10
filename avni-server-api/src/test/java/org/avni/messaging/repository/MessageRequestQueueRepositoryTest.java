package org.avni.messaging.repository;

import org.avni.messaging.domain.MessageRequest;
import org.avni.server.common.AbstractControllerIntegrationTest;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

@Sql(scripts = {"/test-data.sql"})
public class MessageRequestQueueRepositoryTest extends AbstractControllerIntegrationTest {

    @Autowired
    private MessageRequestQueueRepository messageRequestQueueRepository;

    @Test
    @Transactional
    public void shouldRetrieveUndeliveredMessageRequests() {
        Stream<MessageRequest> unsentMessages = messageRequestQueueRepository.findDueMessageRequests();
        assertThat(unsentMessages.findFirst().get().getUuid()).isEqualTo("75925823-109f-41a5-89e3-9c719c88155d");
    }
}