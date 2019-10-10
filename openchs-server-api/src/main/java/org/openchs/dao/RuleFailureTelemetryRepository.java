package org.openchs.dao;

import org.openchs.domain.RuleFailureTelemetry;
import org.openchs.domain.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RuleFailureTelemetryRepository extends CrudRepository<RuleFailureTelemetry, Long> {
    Page<RuleFailureTelemetry> findByIsClosed(Boolean isClosed, Pageable pageable);
    default RuleFailureTelemetry findOne(Long id) {
        return findById(id).orElse(null);
    }
}
