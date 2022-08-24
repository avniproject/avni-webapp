package org.avni.dao.externalSystem;

import org.avni.domain.extenalSystem.ExternalSystemConfig;
import org.avni.domain.extenalSystem.SystemName;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExternalSystemConfigRepository extends CrudRepository<ExternalSystemConfig, Long> {

    ExternalSystemConfig findBySystemName(SystemName systemName);
}
