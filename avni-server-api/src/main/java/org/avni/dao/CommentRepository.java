package org.avni.dao;

import org.avni.domain.AddressLevel;
import org.avni.domain.Comment;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import org.joda.time.DateTime;
import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "comment", path = "comment", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface CommentRepository extends TransactionalDataRepository<Comment>, FindByLastModifiedDateTime<Comment>, OperatingIndividualScopeAwareRepository<Comment> {

    List<Comment> findByIsVoidedFalseAndCommentThreadIdOrderByLastModifiedDateTimeAscIdAsc(Long threadId);

    Page<Comment> findBySubjectAddressLevelInAndSubjectSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            List<AddressLevel> addressLevels,
            Long subjectTypeId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    Page<Comment> findBySubjectFacilityIdAndSubjectSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long facilityId,
            Long subjectTypeId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    boolean existsBySubjectSubjectTypeIdAndLastModifiedDateTimeGreaterThanAndSubjectAddressLevelIdIn(
            Long subjectTypeId,
            DateTime lastModifiedDateTime,
            List<Long> addressIds);

    boolean existsBySubjectFacilityIdAndSubjectSubjectTypeIdAndLastModifiedDateTimeGreaterThan(
            long facilityId,
            Long subjectTypeId,
            DateTime lastModifiedDateTime);

    @Override
    default Page<Comment> syncByCatchment(SyncParameters syncParameters) {
        return findBySubjectAddressLevelInAndSubjectSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime(), syncParameters.getNow(), syncParameters.getPageable());
    }

    @Override
    default Page<Comment> syncByFacility(SyncParameters syncParameters) {
        return findBySubjectFacilityIdAndSubjectSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getCatchmentId(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime(), syncParameters.getNow(), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(List<Long> addressIds, DateTime lastModifiedDateTime, Long typeId){
        return existsBySubjectSubjectTypeIdAndLastModifiedDateTimeGreaterThanAndSubjectAddressLevelIdIn(typeId, lastModifiedDateTime, addressIds);
    }

    @Override
    default boolean isEntityChangedForFacility(long facilityId, DateTime lastModifiedDateTime, Long typeId){
        return existsBySubjectFacilityIdAndSubjectSubjectTypeIdAndLastModifiedDateTimeGreaterThan(facilityId, typeId, lastModifiedDateTime);
    }
}
