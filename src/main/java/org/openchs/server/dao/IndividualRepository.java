package org.openchs.server.dao;

import org.openchs.server.domain.Individual;
import javax.transaction.Transactional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

@Transactional
public interface IndividualRepository extends PagingAndSortingRepository<Individual, Long> {
}