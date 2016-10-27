package org.openchs.dao;

import org.openchs.domain.AddressLevel;
import org.openchs.domain.Concept;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Transactional
@Repository
@RepositoryRestResource(collectionResourceRel = "addressLevel", path = "addressLevel")
public interface AddressLevelRepository extends PagingAndSortingRepository<AddressLevel, Long> {
}