package org.openchs.dao;

import org.openchs.domain.Concept;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Transactional
@Repository
public interface ConceptRepository extends PagingAndSortingRepository<Concept, Long> {
}