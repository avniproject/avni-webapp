package org.avni.dao;

import java.util.Date;

import org.avni.domain.CHSEntity;
import org.avni.domain.AddressLevel;
import org.avni.domain.ParentLocationMapping;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "locationMapping", path = "locationMapping", exported = false)
public interface LocationMappingRepository extends ReferenceDataRepository<ParentLocationMapping>, FindByLastModifiedDateTime<ParentLocationMapping>, OperatingIndividualScopeAwareRepository<ParentLocationMapping> {

    static final DateTime REALLY_OLD_DATE = new DateTime("1900-01-01T00:00:00.000Z");

    Page<ParentLocationMapping> findByParentLocationVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long catchmentId,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable
    );

    boolean existsByParentLocationVirtualCatchmentsIdAndLastModifiedDateTimeGreaterThan(
            long catchmentId,
            Date lastModifiedDateTime
    );

    @Override
    default Page<ParentLocationMapping> getSyncResults(SyncParameters syncParameters) {
        return findByParentLocationVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getCatchment().getId(), CHSEntity.toDate(syncParameters.getLastModifiedDateTime()), CHSEntity.toDate(syncParameters.getNow()), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(SyncParameters syncParameters){
        if(syncParameters.getLastModifiedDateTime().isEqual(REALLY_OLD_DATE)) {
            return true;
        }
        return existsByParentLocationVirtualCatchmentsIdAndLastModifiedDateTimeGreaterThan(syncParameters.getCatchment().getId(), syncParameters.getLastModifiedDateTime().toDate());
    }

    default ParentLocationMapping findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in ParentLocationMapping");
    }

    default ParentLocationMapping findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in ParentLocationMapping");
    }

    List<ParentLocationMapping> findAllByLocation(AddressLevel location);
}
