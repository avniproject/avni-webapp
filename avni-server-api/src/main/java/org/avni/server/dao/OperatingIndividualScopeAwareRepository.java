package org.avni.server.dao;

import org.avni.server.domain.CHSEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface OperatingIndividualScopeAwareRepository<T extends CHSEntity> extends JpaSpecificationExecutor<T> {
    Page<T> getSyncResults(SyncParameters syncParameters);
    boolean isEntityChangedForCatchment(SyncParameters syncParameters);
}
