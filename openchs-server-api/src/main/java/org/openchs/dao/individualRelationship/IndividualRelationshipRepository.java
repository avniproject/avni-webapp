package org.openchs.dao.individualRelationship;

import org.joda.time.DateTime;
import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.dao.OperatingIndividualScopeAwareRepository;
import org.openchs.dao.OperatingIndividualScopeAwareRepositoryWithTypeFilter;
import org.openchs.dao.TransactionalDataRepository;
import org.openchs.domain.Individual;
import org.openchs.domain.individualRelationship.IndividualRelationship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelationship", path = "individualRelationship", exported = false)
public interface IndividualRelationshipRepository extends TransactionalDataRepository<IndividualRelationship>, FindByLastModifiedDateTime<IndividualRelationship>, OperatingIndividualScopeAwareRepository<IndividualRelationship>, OperatingIndividualScopeAwareRepositoryWithTypeFilter<IndividualRelationship> {
    Page<IndividualRelationship> findByIndividualaAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<IndividualRelationship> findByIndividualaFacilityIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<IndividualRelationship> findByIndividualaAddressLevelVirtualCatchmentsIdAndIndividualaSubjectTypeUuidAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, String subjectTypeUuid, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<IndividualRelationship> findByIndividualaFacilityIdAndIndividualaSubjectTypeUuidAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId, String subjectTypeUuid, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    @Override
    default Page<IndividualRelationship> findByCatchmentIndividualOperatingScope(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByIndividualaAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<IndividualRelationship> findByFacilityIndividualOperatingScope(long facilityId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByIndividualaFacilityIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<IndividualRelationship> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, String filter, Pageable pageable) {
        return findByIndividualaAddressLevelVirtualCatchmentsIdAndIndividualaSubjectTypeUuidAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<IndividualRelationship> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, String filter, Pageable pageable) {
        return findByIndividualaFacilityIdAndIndividualaSubjectTypeUuidAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, filter, lastModifiedDateTime, now, pageable);
    }

    List<IndividualRelationship> findByIndividualaAndIndividualBAndIsVoidedFalse(Individual individualA, Individual individualB);
}