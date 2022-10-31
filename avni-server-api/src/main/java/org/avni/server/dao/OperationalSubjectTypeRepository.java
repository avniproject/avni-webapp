package org.avni.server.dao;

import org.avni.server.domain.OperationalSubjectType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Date;

@Repository
@RepositoryRestResource(collectionResourceRel = "operationalSubjectType", path = "operationalSubjectType")
public interface OperationalSubjectTypeRepository extends ImplReferenceDataRepository<OperationalSubjectType> {
    @RestResource(path = "lastModified", rel = "lastModified")
    @Query("select ost from OperationalSubjectType ost where ost.lastModifiedDateTime between :lastModifiedDateTime and :now or ost.subjectType.lastModifiedDateTime between :lastModifiedDateTime and :now order by CASE WHEN ost.subjectType.lastModifiedDateTime > ost.lastModifiedDateTime THEN ost.subjectType.lastModifiedDateTime ELSE ost.lastModifiedDateTime END")
    Page<OperationalSubjectType> findByLastModifiedDateTimeIsBetweenOrSubjectTypeLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date now,
            Pageable pageable);

    @Query("select s.name from OperationalSubjectType s where s.isVoided = false")
    List<String> getAllNames();

    OperationalSubjectType findByNameIgnoreCase(String name);
}
