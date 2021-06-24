package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.CommentThread;
import org.openchs.domain.Individual;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "commentThread", path = "commentThread", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface CommentThreadRepository extends TransactionalDataRepository<CommentThread>, FindByLastModifiedDateTime<CommentThread>, OperatingIndividualScopeAwareRepository<CommentThread> {

    Page<CommentThread> findByComments_SubjectAddressLevelVirtualCatchmentsIdAndComments_SubjectSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId,
            Long subjectTypeId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    Page<CommentThread> findByComments_SubjectFacilityIdAndComments_SubjectSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId,
            Long subjectTypeId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    @Override
    default Page<CommentThread> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByComments_SubjectAddressLevelVirtualCatchmentsIdAndComments_SubjectSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<CommentThread> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByComments_SubjectFacilityIdAndComments_SubjectSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, filter, lastModifiedDateTime, now, pageable);
    }

    List<CommentThread> findDistinctByIsVoidedFalseAndCommentsIsVoidedFalseAndComments_SubjectOrderByOpenDateTimeDescIdDesc(Individual subject);
}
