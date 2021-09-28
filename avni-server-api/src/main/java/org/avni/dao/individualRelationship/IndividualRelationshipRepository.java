package org.avni.dao.individualRelationship;

import org.joda.time.DateTime;
import org.avni.dao.FindByLastModifiedDateTime;
import org.avni.dao.OperatingIndividualScopeAwareRepository;
import org.avni.dao.TransactionalDataRepository;
import org.avni.domain.Individual;
import org.avni.domain.individualRelationship.IndividualRelationship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelationship", path = "individualRelationship", exported = false)
public interface IndividualRelationshipRepository extends TransactionalDataRepository<IndividualRelationship>, FindByLastModifiedDateTime<IndividualRelationship>, OperatingIndividualScopeAwareRepository<IndividualRelationship> {
    Page<IndividualRelationship> findByIndividualaAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<IndividualRelationship> findByIndividualaFacilityIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<IndividualRelationship> findByIndividualaAddressLevelVirtualCatchmentsIdAndIndividualaSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, Long subjectTypeId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<IndividualRelationship> findByIndividualaFacilityIdAndIndividualaSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId, Long subjectTypeId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    @Override
    default Page<IndividualRelationship> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByIndividualaAddressLevelVirtualCatchmentsIdAndIndividualaSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<IndividualRelationship> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByIndividualaFacilityIdAndIndividualaSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, filter, lastModifiedDateTime, now, pageable);
    }

    List<IndividualRelationship> findByIndividualaAndIndividualBAndIsVoidedFalse(Individual individualA, Individual individualB);
}
