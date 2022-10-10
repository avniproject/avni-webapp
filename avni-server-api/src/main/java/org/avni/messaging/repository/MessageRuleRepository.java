package org.avni.messaging.repository;

import org.avni.messaging.domain.EntityType;
import org.avni.messaging.domain.MessageRule;
import org.avni.server.dao.CHSRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRuleRepository extends CHSRepository<MessageRule> {
    Page<MessageRule> findAll(Pageable pageable);

    MessageRule findMessageRuleByEntityTypeAndEntityTypeId(EntityType entityType, String entityTypeId);
    Page<MessageRule> findByEntityTypeAndEntityTypeId(EntityType entityType, String entityTypeId, Pageable pageable);
}
