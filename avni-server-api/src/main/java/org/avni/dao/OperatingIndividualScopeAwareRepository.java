package org.avni.dao;

import org.avni.domain.CHSEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

import org.joda.time.DateTime;
import java.util.List;
import java.util.Date;

@NoRepositoryBean
public interface OperatingIndividualScopeAwareRepository<T extends CHSEntity> extends JpaSpecificationExecutor<T> {
    Page<T> syncByCatchment(SyncParameters syncParameters);
    Page<T> syncByFacility(SyncParameters syncParameters);
    boolean isEntityChangedForCatchment(List<Long> addressIds, Date lastModifiedDateTime, Long typeId);
    boolean isEntityChangedForFacility(long facilityId, Date lastModifiedDateTime, Long typeId);
}
