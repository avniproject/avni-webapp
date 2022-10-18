package org.avni.messaging.repository;

import org.avni.messaging.domain.MessageRequestQueue;
import org.avni.server.dao.CHSRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRequestRepository extends CHSRepository<MessageRequestQueue> {
}
