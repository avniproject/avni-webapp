package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.GroupSubject;
import org.openchs.domain.Individual;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "groupSubject", path = "groupSubject", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface GroupSubjectRepository extends TransactionalDataRepository<GroupSubject>, OperatingIndividualScopeAwareRepositoryWithTypeFilter<GroupSubject> {
    default GroupSubject findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in GroupSubject");
    }

    default GroupSubject findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in GroupSubject");
    }

    Page<GroupSubject> findByGroupSubjectAddressLevelVirtualCatchmentsIdAndGroupRoleGroupSubjectTypeUuidAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId,
            String groupSubjectTypeUUID,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable
    );

    Page<GroupSubject> findByGroupSubjectFacilityIdAndGroupRoleGroupSubjectTypeUuidAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId,
            String groupSubjectTypeUUID,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable
    );

    @Override
    default Page<GroupSubject> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, String filter, Pageable pageable) {
        return findByGroupSubjectAddressLevelVirtualCatchmentsIdAndGroupRoleGroupSubjectTypeUuidAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<GroupSubject> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, String filter, Pageable pageable) {
        return findByGroupSubjectFacilityIdAndGroupRoleGroupSubjectTypeUuidAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, filter, lastModifiedDateTime, now, pageable);
    }

    GroupSubject findByGroupSubjectAndMemberSubject(Individual groupSubject, Individual memberSubject);
}
