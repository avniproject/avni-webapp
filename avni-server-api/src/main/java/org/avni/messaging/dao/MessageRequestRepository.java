package org.avni.messaging.dao;

import org.avni.messaging.domain.MessageRequest;
import org.avni.server.dao.CHSRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRequestRepository extends CHSRepository<MessageRequest> {
}
