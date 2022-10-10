package org.avni.messaging.repository;

import org.avni.messaging.domain.MessageReceiver;
import org.avni.server.dao.CHSRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageReceiverRepository  extends CHSRepository<MessageReceiver> {
}
