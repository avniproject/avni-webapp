package org.openchs.server.dao;

import org.openchs.server.domain.Individual;
import javax.transaction.Transactional;

import org.springframework.data.repository.CrudRepository;

@Transactional
public interface AllIndividuals extends CrudRepository<Individual, Long> {
}