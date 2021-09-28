package org.avni.dao;

import org.avni.domain.UserFacilityMapping;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserFacilityMappingRepository extends CHSRepository<UserFacilityMapping>, PagingAndSortingRepository<UserFacilityMapping, Long> {
}
