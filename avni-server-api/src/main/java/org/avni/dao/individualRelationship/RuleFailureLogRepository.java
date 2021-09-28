package org.avni.dao.individualRelationship;

import org.avni.domain.RuleFailureLog;
import org.avni.domain.RuleFailureTelemetry;
import org.springframework.data.repository.CrudRepository;

public interface RuleFailureLogRepository extends CrudRepository<RuleFailureLog, Long> {
}
