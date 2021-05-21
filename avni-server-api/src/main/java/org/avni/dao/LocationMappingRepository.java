package org.avni.dao;

import org.joda.time.DateTime;
import org.avni.domain.AddressLevel;
import org.avni.domain.ParentLocationMapping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
@RepositoryRestResource(collectionResourceRel = "locationMapping", path = "locationMapping", exported = false)
public interface LocationMappingRepository extends ReferenceDataRepository<ParentLocationMapping>, FindByLastModifiedDateTime<ParentLocationMapping>, OperatingIndividualScopeAwareRepository<ParentLocationMapping> {
    Page<ParentLocationMapping> findByParentLocationInAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            List<AddressLevel> addressLevelIds,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    boolean existsByAuditLastModifiedDateTimeGreaterThanAndParentLocationIdIn(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("addressIds") List<Long> addressIds);

    @Override
    default Page<ParentLocationMapping> syncByCatchment(SyncParameters syncParameters) {
        return findByParentLocationInAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), syncParameters.getLastModifiedDateTime(), syncParameters.getNow(), syncParameters.getPageable());
    }

    @Override
    default Page<ParentLocationMapping> syncByFacility(SyncParameters syncParameters) {
        return findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(syncParameters.getLastModifiedDateTime(), syncParameters.getNow(), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(List<Long> addressIds, DateTime lastModifiedDateTime, Long typeId){
        return existsByAuditLastModifiedDateTimeGreaterThanAndParentLocationIdIn(lastModifiedDateTime, addressIds);
    }

    @Override
    default boolean isEntityChangedForFacility(long facilityId, DateTime lastModifiedDateTime, Long typeId){
        return existsByAuditLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }

    default ParentLocationMapping findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in ParentLocationMapping");
    }

    default ParentLocationMapping findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in ParentLocationMapping");
    }

    List<ParentLocationMapping> findAllByLocation(AddressLevel location);
}
