package org.avni.dao.individualRelationship;

import org.avni.dao.FindByLastModifiedDateTime;
import org.avni.dao.OperatingIndividualScopeAwareRepository;
import org.avni.dao.SyncParameters;
import org.avni.dao.TransactionalDataRepository;
import org.avni.domain.AddressLevel;
import org.avni.domain.Individual;
import org.avni.domain.individualRelationship.IndividualRelationship;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelationship", path = "individualRelationship", exported = false)
public interface IndividualRelationshipRepository extends TransactionalDataRepository<IndividualRelationship>, FindByLastModifiedDateTime<IndividualRelationship>, OperatingIndividualScopeAwareRepository<IndividualRelationship> {
    Page<IndividualRelationship> findByIndividualaAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<IndividualRelationship> findByIndividualaAddressLevelInAndIndividualaSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            List<AddressLevel> addressLevels, Long subjectTypeId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<IndividualRelationship> findByIndividualaFacilityIdAndIndividualaSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId, Long subjectTypeId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    boolean existsByIndividualaSubjectTypeIdAndAuditLastModifiedDateTimeGreaterThanAndIndividualaAddressLevelIdIn(
            Long subjectTypeId, DateTime lastModifiedDateTime, List<Long> addressIds);

    boolean existsByIndividualaFacilityIdAndIndividualaSubjectTypeIdAndAuditLastModifiedDateTimeGreaterThan(
            long facilityId, Long subjectTypeId, DateTime lastModifiedDateTime);

    @Query(value = "select ir from IndividualRelationship ir where ir.individuala = :individual or ir.individualB = :individual")
    Set<IndividualRelationship> findByIndividual(Individual individual);

    @Override
    default Page<IndividualRelationship> syncByCatchment(SyncParameters syncParameters) {
        return findByIndividualaAddressLevelInAndIndividualaSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime(), syncParameters.getNow(), syncParameters.getPageable());
    }

    @Override
    default Page<IndividualRelationship> syncByFacility(SyncParameters syncParameters) {
        return findByIndividualaFacilityIdAndIndividualaSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(syncParameters.getCatchmentId(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime(), syncParameters.getNow(), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(List<Long> addressIds, DateTime lastModifiedDateTime, Long typeId){
        return existsByIndividualaSubjectTypeIdAndAuditLastModifiedDateTimeGreaterThanAndIndividualaAddressLevelIdIn(typeId, lastModifiedDateTime, addressIds);
    }

    @Override
    default boolean isEntityChangedForFacility(long facilityId, DateTime lastModifiedDateTime, Long typeId){
        return existsByIndividualaFacilityIdAndIndividualaSubjectTypeIdAndAuditLastModifiedDateTimeGreaterThan(facilityId, typeId, lastModifiedDateTime);
    }

    List<IndividualRelationship> findByIndividualaAndIndividualBAndIsVoidedFalse(Individual individualA, Individual individualB);
}
