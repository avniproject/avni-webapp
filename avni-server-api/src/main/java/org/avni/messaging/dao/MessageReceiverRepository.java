package org.avni.messaging.dao;

import org.avni.messaging.domain.MessageReceiver;
import org.avni.server.dao.CHSRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageReceiverRepository  extends CHSRepository<MessageReceiver> {
}
