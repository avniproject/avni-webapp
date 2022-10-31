package org.avni.server.dao;

import org.avni.server.domain.Program;
import org.avni.server.domain.Program.ProgramProjection;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "program", path = "program")
public interface ProgramRepository extends ReferenceDataRepository<Program>, FindByLastModifiedDateTime<Program> {
    @Query("select o from Program o where o.operationalPrograms is not empty and o.isVoided = false")
    List<ProgramProjection> findAllOperational();

    @Query("select p.name from Program p where p.isVoided = false")
    List<String> getAllNames();
}
