package org.avni.server.dao;

import org.avni.server.domain.EncounterType;
import org.avni.server.domain.OperationalEncounterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "operationalEncounterType", path = "operationalEncounterType")
public interface OperationalEncounterTypeRepository extends ImplReferenceDataRepository<OperationalEncounterType> {
    @RestResource(path = "lastModified", rel = "lastModified")
    @Query("select oet from OperationalEncounterType oet where oet.lastModifiedDateTime between :lastModifiedDateTime and :now or oet.encounterType.lastModifiedDateTime between :lastModifiedDateTime and :now order by CASE WHEN oet.encounterType.lastModifiedDateTime > oet.lastModifiedDateTime THEN oet.encounterType.lastModifiedDateTime ELSE oet.lastModifiedDateTime END")
    Page<OperationalEncounterType> findByLastModifiedDateTimeIsBetweenOrEncounterTypeLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date now,
            Pageable pageable);

    OperationalEncounterType findByEncounterTypeAndOrganisationId(EncounterType encounterType, long organisationId);

    @Query("select o.name from OperationalEncounterType o where o.isVoided = false")
    List<String> getAllNames();
}
