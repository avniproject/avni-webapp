package org.avni.dao;

import org.avni.domain.SyncTelemetry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SyncTelemetryRepository extends JpaRepository<SyncTelemetry, Long> {

    Page<SyncTelemetry> findAllByOrderByIdDesc(Pageable pageable);
}
