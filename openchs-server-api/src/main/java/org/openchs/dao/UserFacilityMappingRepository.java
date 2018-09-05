package org.openchs.dao;

import org.openchs.domain.UserFacilityMapping;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserFacilityMappingRepository extends CHSRepository<UserFacilityMapping> {
}