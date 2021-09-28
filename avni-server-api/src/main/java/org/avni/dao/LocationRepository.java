package org.avni.dao;


import org.joda.time.DateTime;
import org.avni.domain.AddressLevel;
import org.avni.domain.AddressLevelType;
import org.avni.domain.Catchment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
@RepositoryRestResource(collectionResourceRel = "locations", path = "locations")
public interface LocationRepository extends ReferenceDataRepository<AddressLevel>, FindByLastModifiedDateTime<AddressLevel>, OperatingIndividualScopeAwareRepository<AddressLevel> {

    @RestResource(path = "findAllById", rel = "findAllById")
    List<AddressLevel> findByIdIn(@Param("ids") Long[] ids);

    Page<AddressLevel> findByVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId,
            DateTime lastModifiedDateTime,
            DateTime now,
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

    Page<AddressLevel> findByAuditLastModifiedDateTimeAfterAndTypeIn(DateTime audit_lastModifiedDateTime, Collection<@NotNull AddressLevelType> type, Pageable pageable);

    @Override
    default Page<AddressLevel> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<AddressLevel> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, pageable);
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

    List<AddressLevel> findByType_IdAndIsVoidedFalseOrderByTitleAsc(Long typeId);

    @Query("select a.title from AddressLevel a where a.isVoided = false")
    List<String> getAllNames();

    Optional<AddressLevel> findByTitleLineageIgnoreCase(String locationTitleLineage);
    List<AddressLevel> getAllByIsVoidedFalse();

    List<AddressLevel> findAllByParent(AddressLevel parent);

    List<AddressLevel> findByUuidIn(List<String> addressLevelUUIDs);

    @Query(value="select id from address_level where lineage ~ cast(:lquery as lquery)", nativeQuery = true)
    List<Long> getAllChildrenLocationsIds(@Param("lquery") String lquery);

}
