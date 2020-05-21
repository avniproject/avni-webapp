package org.openchs.dao;

import org.openchs.domain.SyncTelemetry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SyncTelemetryRepository extends JpaRepository<SyncTelemetry, Long> {
}
