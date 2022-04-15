package org.avni.dao;

import java.util.Date;

import org.avni.application.projections.LocationProjection;
import org.avni.application.projections.VirtualCatchmentProjection;
import org.joda.time.DateTime;
import org.avni.domain.AddressLevel;
import org.avni.domain.AddressLevelType;
import org.avni.domain.Catchment;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import org.joda.time.DateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RepositoryRestResource(collectionResourceRel = "locations", path = "locations")
public interface LocationRepository extends ReferenceDataRepository<AddressLevel>, FindByLastModifiedDateTime<AddressLevel>, OperatingIndividualScopeAwareRepository<AddressLevel> {

    @RestResource(path = "findAllById", rel = "findAllById")
    List<AddressLevel> findByIdIn(@Param("ids") Long[] ids);

    Page<AddressLevel> findByVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long catchmentId,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable);

    boolean existsByLastModifiedDateTimeIsGreaterThanAndIdIn(
            Date lastModifiedDateTime,
            List<Long> addressIds);

    Page<AddressLevel> findByIdInAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            List<Long> addressLevelIds,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable);

    AddressLevel findByTitleAndCatchmentsUuid(String title, String uuid);

    @Query(value = "SELECT a FROM AddressLevel a " +
            "where (:title is null or lower(a.title) like lower(concat('%', :title,'%'))) " +
            "and a.isVoided = false order by a.title ")
    Page<AddressLevel> findByIsVoidedFalseAndTitleIgnoreCaseStartingWithOrderByTitleAsc(String title, Pageable pageable);

    AddressLevel findByTitleIgnoreCase(String title);

    AddressLevel findByTitleIgnoreCaseAndTypeAndParentIsNull(String title, AddressLevelType addressLevelType);

    AddressLevel findByTitleIgnoreCaseAndTypeIn(String title, Collection<AddressLevelType> type);

    List<AddressLevel> findByCatchments(Catchment catchment);

    Page<AddressLevel> findByLastModifiedDateTimeAfterAndTypeIn(Date lastModifiedDateTime, Collection<@NotNull AddressLevelType> type, Pageable pageable);

    boolean existsByLastModifiedDateTimeAfterAndTypeIn(Date lastModifiedDateTime, Collection<@NotNull AddressLevelType> type);

    @Override
    default Page<AddressLevel> getSyncResults(SyncParameters syncParameters) {
        return findByIdInAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), syncParameters.getLastModifiedDateTime().toDate(), syncParameters.getNow().toDate(), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(SyncParameters syncParameters){
        return existsByLastModifiedDateTimeIsGreaterThanAndIdIn(syncParameters.getLastModifiedDateTime().toDate(), syncParameters.getAddressLevels());
    }

    default AddressLevel findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in Location. Field 'title' not unique.");
    }

    default AddressLevel findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in Location. Field 'title' not unique.");
    }

    @Query(value="SELECT * FROM address_level WHERE lineage ~ CAST(:lquery as lquery) \n-- #pageable\n",
            countQuery = "SELECT count(*) FROM address_level WHERE lineage ~ CAST(:lquery as lquery)",
            nativeQuery = true)
    Page<AddressLevel> getAddressLevelsByLquery(@Param("lquery") String lquery, Pageable pageable);

    AddressLevel findByParentAndTitleIgnoreCaseAndIsVoidedFalse(AddressLevel parent, String title);

    @RestResource(path = "findByParent", rel = "findByParent")
    Page<AddressLevel> findByIsVoidedFalseAndParent_Id(@Param("parentId") Long parentId, Pageable pageable);

    @RestResource(path = "autocompleteLocationsOfType", rel = "autocompleteLocationsOfType")
    List<AddressLevel> findByType_IdAndTitleIgnoreCaseStartingWithAndIsVoidedFalseOrderByTitleAsc(@Param("typeId") Long typeId,
                                                                                  @Param("title") String title);

    @Query("select a.title from AddressLevel a where a.isVoided = false")
    List<String> getAllNames();

    @Query(value = "select lowestpoint_id from title_lineage_locations_view where lower(title_lineage) = lower(:locationTitleLineage)", nativeQuery = true)
    Long getAddressIdByLineage(String locationTitleLineage);

    default Optional<AddressLevel> findByTitleLineageIgnoreCase(String locationTitleLineage) {
        Long addressId = getAddressIdByLineage(locationTitleLineage);
        return addressId != null ? findById(addressId) : Optional.empty();
    }

    List<AddressLevel> getAllByIsVoidedFalse();

    List<AddressLevel> findAllByParent(AddressLevel parent);

    List<AddressLevel> findByUuidIn(List<String> addressLevelUUIDs);

    List<AddressLevel> findByIsVoidedFalseAndTitleIgnoreCaseContains(String title);

    @Query(value="select id from address_level where lineage ~ cast(:lquery as lquery)", nativeQuery = true)
    List<Long> getAllChildrenLocationsIds(@Param("lquery") String lquery);

    @Query(value="select * from virtual_catchment_address_mapping_table where catchment_id = :catchmentId", nativeQuery = true)
    List<VirtualCatchmentProjection> getVirtualCatchmentsForCatchmentId(@Param("catchmentId") Long catchmentId);

    @Query(value="select * from virtual_catchment_address_mapping_table where addresslevel_id in (:addressLevelIds)", nativeQuery = true)
    List<VirtualCatchmentProjection> getVirtualCatchmentsForAddressLevelIds(@Param("addressLevelIds") List<Long> addressLevelIds);

    @Query(value = "select title_lineage from title_lineage_locations_function(:addressId)", nativeQuery = true)
    String getTitleLineageById(Long addressId);

    @Query(value = "select al.id, al.uuid, title, type_id as typeId, alt.name as typeString, al.parent_id as parentId, " +
            "cast(lineage as text) as lineage, title_lineage as titleLineage, alt.level " +
            "from address_level al " +
            "left join address_level_type alt on alt.id = al.type_id " +
            "left join title_lineage_locations_view tll on tll.lowestpoint_id = al.id " +
            "where al.is_voided = false",
            nativeQuery = true)
    Page<LocationProjection> findNonVoidedLocations(Pageable pageable);

    @Query(value = "select al.id, al.uuid, title, type_id as typeId, alt.name as typeString, al.parent_id as parentId, " +
            "cast(lineage as text) as lineage, title_lineage as titleLineage, alt.level " +
            "from address_level al " +
            "left join address_level_type alt on alt.id = al.type_id " +
            "left join title_lineage_locations_view tll on tll.lowestpoint_id = al.id " +
            "where al.is_voided = false " +
            "and al.type_id = :typeId " +
            "order by al.title ",
            nativeQuery = true)
    List<LocationProjection> findNonVoidedLocationsByTypeId(Long typeId);

    @Query(value = "select al.id, al.uuid, title, type_id as typeId, alt.name as typeString, al.parent_id as parentId, " +
            "cast(lineage as text) as lineage, title_lineage as titleLineage, alt.level " +
            "from address_level al " +
            "left join address_level_type alt on alt.id = al.type_id " +
            "left join title_lineage_locations_view tll on tll.lowestpoint_id = al.id " +
            "where al.is_voided = false ",
            nativeQuery = true)
    List<LocationProjection> findAllNonVoided();

    @Query(value = "select al.id, al.uuid, title, type_id as typeId, alt.name as typeString, al.parent_id as parentId, " +
            "cast(lineage as text) as lineage, title_lineage as titleLineage, alt.level " +
            "from address_level al " +
            "left join address_level_type alt on alt.id = al.type_id " +
            "left join title_lineage_locations_view tll on tll.lowestpoint_id = al.id " +
            "where al.is_voided = false " +
            "and al.uuid = :uuid ",
            nativeQuery = true)
    LocationProjection findNonVoidedLocationsByUuid(String uuid);

}
