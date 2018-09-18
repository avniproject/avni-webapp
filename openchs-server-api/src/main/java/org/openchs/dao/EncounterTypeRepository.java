package org.openchs.dao;

import org.openchs.domain.EncounterType;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "encounterType", path = "encounterType")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface EncounterTypeRepository extends PagingAndSortingRepository<EncounterType, Long>, ReferenceDataRepository<EncounterType>, FindByLastModifiedDateTime<EncounterType> {
    List<EncounterType> findAllByName(String name);
}