package org.avni.dao;

import org.joda.time.DateTime;
import org.avni.domain.SubjectType;
import org.avni.domain.OperationalSubjectType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "operationalSubjectType", path = "operationalSubjectType")
public interface OperationalSubjectTypeRepository extends ImplReferenceDataRepository<OperationalSubjectType> {
    @RestResource(path = "lastModified", rel = "lastModified")
    @Query("select ost from OperationalSubjectType ost where ost.audit.lastModifiedDateTime between :lastModifiedDateTime and :now or ost.subjectType.audit.lastModifiedDateTime between :lastModifiedDateTime and :now order by CASE WHEN ost.subjectType.audit.lastModifiedDateTime > ost.audit.lastModifiedDateTime THEN ost.subjectType.audit.lastModifiedDateTime ELSE ost.audit.lastModifiedDateTime END")
    Page<OperationalSubjectType> findByAuditLastModifiedDateTimeIsBetweenOrSubjectTypeAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);

    @Query("select s.name from OperationalSubjectType s where s.isVoided = false")
    List<String> getAllNames();

    OperationalSubjectType findByNameIgnoreCase(String name);
}
