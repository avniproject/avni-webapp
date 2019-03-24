package org.openchs.dao;

import org.openchs.domain.Catchment;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "catchment", path = "catchment")
public interface CatchmentRepository extends ReferenceDataRepository<Catchment>, FindByLastModifiedDateTime<Catchment> {
    @RestResource(path = "findAllById", rel = "findAllById")
    List<Catchment> findByIdIn(@Param("ids") Long[] ids);
}
