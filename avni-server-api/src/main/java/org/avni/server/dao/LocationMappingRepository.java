package org.avni.server.dao;

import org.avni.server.domain.AddressLevel;
import org.avni.server.domain.ParentLocationMapping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "locationMapping", path = "locationMapping", exported = false)
public interface LocationMappingRepository extends ReferenceDataRepository<ParentLocationMapping>, FindByLastModifiedDateTime<ParentLocationMapping>, OperatingIndividualScopeAwareRepository<ParentLocationMapping> {

    @Query(value = "select llm.*\n" +
            "from location_location_mapping llm\n" +
            "         left outer join address_level al on llm.parent_location_id = al.id\n" +
            "         left outer join catchment_address_mapping cam on al.lineage ~ cast((cam.addresslevel_id || '.*') as lquery)\n" +
            "         left outer join catchment c on cam.catchment_id = c.id\n" +
            "where c.id = :catchmentId\n" +
            "  and llm.last_modified_date_time between :lastModifiedDateTime and :now\n" +
            "order by llm.last_modified_date_time asc, llm.id asc", nativeQuery = true)
    Page<ParentLocationMapping> getSyncResults(
            long catchmentId,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable
    );

    @Query(value = "select count(*)\n" +
            "from location_location_mapping llm\n" +
            "         left outer join address_level al on llm.parent_location_id = al.id\n" +
            "         left outer join catchment_address_mapping cam on al.lineage ~ cast((cam.addresslevel_id || '.*') as lquery)\n" +
            "         left outer join catchment c on cam.catchment_id = c.id\n" +
            "where c.id = :catchmentId\n" +
            "  and llm.last_modified_date_time > :lastModifiedDateTime\n", nativeQuery = true)
    Long getChangedRowCount(long catchmentId, Date lastModifiedDateTime);

    @Override
    default Page<ParentLocationMapping> getSyncResults(SyncParameters syncParameters) {
        return getSyncResults(syncParameters.getCatchment().getId(), syncParameters.getLastModifiedDateTime().toDate(), syncParameters.getNow().toDate(), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(SyncParameters syncParameters) {
        return getChangedRowCount(syncParameters.getCatchment().getId(), syncParameters.getLastModifiedDateTime().toDate()) > 0;
    }

    default ParentLocationMapping findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in ParentLocationMapping");
    }

    default ParentLocationMapping findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in ParentLocationMapping");
    }

    List<ParentLocationMapping> findAllByLocation(AddressLevel location);
}
