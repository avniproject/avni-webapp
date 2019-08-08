package org.openchs.dao;

import org.openchs.domain.RuleFailureTelemetry;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RuleFailureTelemetryRepository extends CrudRepository<RuleFailureTelemetry, Long> {
}
