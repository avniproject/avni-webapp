package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.OperationalProgram;
import org.openchs.domain.Program;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "operationalProgram", path = "operationalProgram")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface OperationalProgramRepository extends PagingAndSortingRepository<OperationalProgram, Long>, ReferenceDataRepository<OperationalProgram> {
    @RestResource(path = "lastModified", rel = "lastModified")
    @Query("select op from OperationalProgram op where op.audit.lastModifiedDateTime > :lastModifiedDateTime or op.program.audit.lastModifiedDateTime > :lastModifiedDateTime order by CASE WHEN op.program.audit.lastModifiedDateTime > op.audit.lastModifiedDateTime THEN op.program.audit.lastModifiedDateTime ELSE op.audit.lastModifiedDateTime END")
    Page<OperationalProgram> findByAuditLastModifiedDateTimeGreaterThanOrProgramAuditLastModifiedDateTimeGreaterThanOrderByAuditLastModifiedDateTimeAscIdAsc(@Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);


    @Query("select op from OperationalProgram op where op.audit.lastModifiedDateTime between :lastModifiedDateTime and :now or op.program.audit.lastModifiedDateTime between :lastModifiedDateTime and :now order by CASE WHEN op.program.audit.lastModifiedDateTime > op.audit.lastModifiedDateTime THEN op.program.audit.lastModifiedDateTime ELSE op.audit.lastModifiedDateTime END")
    Page<OperationalProgram> findByAuditLastModifiedDateTimeIsBetweenOrProgramAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);

    OperationalProgram findByProgramAndOrganisationId(Program program, long organisationId);

    OperationalProgram findByProgramIdAndOrganisationId(long programId, long organisationId);
}