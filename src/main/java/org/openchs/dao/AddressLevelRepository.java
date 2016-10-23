package org.openchs.dao;

import org.openchs.domain.AddressLevel;
import org.openchs.domain.Concept;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Repository
public interface AddressLevelRepository extends PagingAndSortingRepository<AddressLevel, Long> {
}