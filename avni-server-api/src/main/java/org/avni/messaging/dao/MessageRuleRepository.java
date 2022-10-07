package org.avni.messaging.dao;

import org.avni.messaging.domain.MessageRule;
import org.avni.server.dao.CHSRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRuleRepository extends CHSRepository<MessageRule> {
    Page<MessageRule> findAll(Pageable pageable);
}
