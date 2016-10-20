package org.openchs.server.dao;

import org.openchs.server.domain.ObservationGroup;
import org.springframework.data.repository.PagingAndSortingRepository;

import javax.transaction.Transactional;

@Transactional
public interface ObservationGroupRepository extends PagingAndSortingRepository<ObservationGroup, Long> {
}