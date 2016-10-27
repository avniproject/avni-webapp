package org.openchs.dao;

import org.openchs.domain.Gender;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Transactional
@Repository
@RepositoryRestResource(collectionResourceRel = "gender", path = "gender")
public interface GenderRepository extends PagingAndSortingRepository<Gender, Long> {
}