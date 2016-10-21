package org.openchs.dao;

import org.openchs.domain.Individual;
import javax.transaction.Transactional;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Transactional
@Repository
public interface IndividualRepository extends PagingAndSortingRepository<Individual, Long> {
}