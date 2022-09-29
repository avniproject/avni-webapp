package org.avni.server.dao;

import org.avni.server.domain.Catchment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "catchment", path = "catchment")
public interface CatchmentRepository extends ReferenceDataRepository<Catchment>, FindByLastModifiedDateTime<Catchment> {
    List<Catchment> findByIdIn(@Param("ids") Long[] ids);

    @Query("select c.name from Catchment c where c.isVoided = false")
    List<String> getAllNames();

    Page<Catchment> findByIsVoidedFalseAndNameIgnoreCaseStartingWithOrderByNameAsc(String name, Pageable pageable);
}
