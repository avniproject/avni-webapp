package org.openchs.dao.individualRelationship;

import org.openchs.domain.RuleFailureLog;
import org.openchs.domain.RuleFailureTelemetry;
import org.springframework.data.repository.CrudRepository;

public interface RuleFailureLogRepository extends CrudRepository<RuleFailureLog, Long> {
}
