package org.openchs.dao;

import org.openchs.domain.SyncTelemetry;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SyncTelemetryRepository extends CrudRepository<SyncTelemetry, Long> {
}