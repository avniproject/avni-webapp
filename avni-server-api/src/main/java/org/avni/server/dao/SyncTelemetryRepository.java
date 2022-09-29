package org.avni.server.dao;

import org.avni.server.domain.SyncTelemetry;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyncTelemetryRepository extends JpaRepository<SyncTelemetry, Long>, JpaSpecificationExecutor<SyncTelemetry> {

    Page<SyncTelemetry> findAllByOrderByIdDesc(Pageable pageable);

    Page<SyncTelemetry> findAllByUserIdInOrderByIdDesc(List<Long> userIds, Pageable pageable);

    Page<SyncTelemetry> findAllBySyncStartTimeBetweenOrderByIdDesc(DateTime startDate, DateTime endDate, Pageable pageable);

    Page<SyncTelemetry> findAllByUserIdInAndSyncStartTimeBetweenOrderByIdDesc(List<Long> userIds, DateTime startDate, DateTime endDate, Pageable pageable);
}
