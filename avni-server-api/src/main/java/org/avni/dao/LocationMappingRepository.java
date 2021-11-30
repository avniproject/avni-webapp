package org.avni.dao;

import java.util.Date;

import org.avni.domain.CHSEntity;
import org.avni.domain.AddressLevel;
import org.avni.domain.ParentLocationMapping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "locationMapping", path = "locationMapping", exported = false)
public interface LocationMappingRepository extends ReferenceDataRepository<ParentLocationMapping>, FindByLastModifiedDateTime<ParentLocationMapping>, OperatingIndividualScopeAwareRepository<ParentLocationMapping> {
    Page<ParentLocationMapping> findByParentLocationIdInAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            List<Long> addressLevelIds,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable);

    boolean existsByLastModifiedDateTimeGreaterThanAndParentLocationIdIn(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date lastModifiedDateTime,
            @Param("addressIds") List<Long> addressIds);

    @Override
    default Page<ParentLocationMapping> syncByCatchment(SyncParameters syncParameters) {
        return findByParentLocationIdInAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), CHSEntity.toDate(syncParameters.getLastModifiedDateTime()), CHSEntity.toDate(syncParameters.getNow()), syncParameters.getPageable());
    }

    @Override
    default Page<ParentLocationMapping> syncByFacility(SyncParameters syncParameters) {
        return findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getLastModifiedDateTime(), syncParameters.getNow(), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(List<Long> addressIds, Date lastModifiedDateTime, Long typeId){
        return existsByLastModifiedDateTimeGreaterThanAndParentLocationIdIn(lastModifiedDateTime, addressIds);
    }

    @Override
    default boolean isEntityChangedForFacility(long facilityId, Date lastModifiedDateTime, Long typeId){
        return existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }

    default ParentLocationMapping findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in ParentLocationMapping");
    }

    default ParentLocationMapping findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in ParentLocationMapping");
    }

    List<ParentLocationMapping> findAllByLocation(AddressLevel location);
}
