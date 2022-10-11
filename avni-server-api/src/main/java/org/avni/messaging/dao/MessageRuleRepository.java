package org.avni.messaging.dao;

import org.avni.messaging.domain.EntityType;
import org.avni.messaging.domain.MessageRule;
import org.avni.server.dao.CHSRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.parser.Entity;

@Repository
public interface MessageRuleRepository extends CHSRepository<MessageRule> {
    Page<MessageRule> findAll(Pageable pageable);

    MessageRule findMessageRuleByEntityTypeAndEntityTypeId(EntityType entityType, String entityTypeId);
}
