package org.openchs.dao;

import org.openchs.domain.ObservationGroup;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Transactional
@Repository
public interface ObservationGroupRepository extends PagingAndSortingRepository<ObservationGroup, Long> {
}