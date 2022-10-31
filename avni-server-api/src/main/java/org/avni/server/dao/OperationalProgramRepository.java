package org.avni.server.dao;

import org.avni.server.domain.OperationalProgram;
import org.avni.server.domain.Program;
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
@RepositoryRestResource(collectionResourceRel = "operationalProgram", path = "operationalProgram")
public interface OperationalProgramRepository extends ImplReferenceDataRepository<OperationalProgram> {
    @RestResource(path = "lastModified", rel = "lastModified")
    @Query("select op from OperationalProgram op where op.lastModifiedDateTime > :lastModifiedDateTime or op.program.lastModifiedDateTime > :lastModifiedDateTime order by CASE WHEN op.program.lastModifiedDateTime > op.lastModifiedDateTime THEN op.program.lastModifiedDateTime ELSE op.lastModifiedDateTime END")
    Page<OperationalProgram> findByLastModifiedDateTimeGreaterThanOrProgramLastModifiedDateTimeGreaterThanOrderByLastModifiedDateTimeAscIdAsc(@Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date lastModifiedDateTime, Pageable pageable);

    OperationalProgram findByProgramAndOrganisationId(Program program, long organisationId);

    @Query("select o.name from OperationalProgram o where o.isVoided = false")
    List<String> getAllNames();

}
