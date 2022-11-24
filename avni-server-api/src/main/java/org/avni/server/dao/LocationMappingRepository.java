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
            "from catchment c\n" +
            "         inner join catchment_address_mapping cam on c.id = cam.catchment_id\n" +
            "         inner join address_level al on cam.addresslevel_id = al.id\n" +
            "         inner join address_level al1 on al.lineage @> al1.lineage and al.id <> al1.id\n" +
            "         inner join location_location_mapping llm on al1.id = llm.location_id\n" +
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
            "from catchment c\n" +
            "         inner join catchment_address_mapping cam on c.id = cam.catchment_id\n" +
            "         inner join address_level al on cam.addresslevel_id = al.id\n" +
            "         inner join address_level al1 on al.lineage @> al1.lineage and al.id <> al1.id\n" +
            "         inner join location_location_mapping llm on al1.id = llm.location_id\n" +
            "where c.id = :catchmentId \n" +
            "  and llm.last_modified_date_time > :lastModifiedDateTime ;", nativeQuery = true)
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
