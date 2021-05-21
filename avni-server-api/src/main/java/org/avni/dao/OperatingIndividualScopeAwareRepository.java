package org.avni.dao;

import org.avni.domain.CHSEntity;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;

@NoRepositoryBean
public interface OperatingIndividualScopeAwareRepository<T extends CHSEntity> extends JpaSpecificationExecutor<T> {
    Page<T> syncByCatchment(SyncParameters syncParameters);
    Page<T> syncByFacility(SyncParameters syncParameters);
    boolean isEntityChangedForCatchment(List<Long> addressIds, DateTime lastModifiedDateTime, Long typeId);
    boolean isEntityChangedForFacility(long facilityId, DateTime lastModifiedDateTime, Long typeId);
}
