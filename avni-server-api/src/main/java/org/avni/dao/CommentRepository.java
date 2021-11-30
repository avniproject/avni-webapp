package org.avni.dao;

import java.util.Date;
import org.avni.domain.AddressLevel;
import org.avni.domain.CHSEntity;
import org.avni.domain.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "comment", path = "comment", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface CommentRepository extends TransactionalDataRepository<Comment>, FindByLastModifiedDateTime<Comment>, OperatingIndividualScopeAwareRepository<Comment> {

    List<Comment> findByIsVoidedFalseAndCommentThreadIdOrderByLastModifiedDateTimeAscIdAsc(Long threadId);

    Page<Comment> findBySubjectAddressLevelIdInAndSubjectSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            List<Long> addressLevels,
            Long subjectTypeId,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable);

    Page<Comment> findBySubjectFacilityIdAndSubjectSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long facilityId,
            Long subjectTypeId,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable);

    boolean existsBySubjectSubjectTypeIdAndLastModifiedDateTimeGreaterThanAndSubjectAddressLevelIdIn(
            Long subjectTypeId,
            Date lastModifiedDateTime,
            List<Long> addressIds);

    boolean existsBySubjectFacilityIdAndSubjectSubjectTypeIdAndLastModifiedDateTimeGreaterThan(
            long facilityId,
            Long subjectTypeId,
            Date lastModifiedDateTime);

    @Override
    default Page<Comment> syncByCatchment(SyncParameters syncParameters) {
        return findBySubjectAddressLevelIdInAndSubjectSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), syncParameters.getFilter(), CHSEntity.toDate(syncParameters.getLastModifiedDateTime()), CHSEntity.toDate(syncParameters.getNow()), syncParameters.getPageable());
    }

    @Override
    default Page<Comment> syncByFacility(SyncParameters syncParameters) {
        return findBySubjectFacilityIdAndSubjectSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getCatchmentId(), syncParameters.getFilter(), CHSEntity.toDate(syncParameters.getLastModifiedDateTime()), CHSEntity.toDate(syncParameters.getNow()), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(List<Long> addressIds, Date lastModifiedDateTime, Long typeId){
        return existsBySubjectSubjectTypeIdAndLastModifiedDateTimeGreaterThanAndSubjectAddressLevelIdIn(typeId, lastModifiedDateTime, addressIds);
    }

    @Override
    default boolean isEntityChangedForFacility(long facilityId, Date lastModifiedDateTime, Long typeId){
        return existsBySubjectFacilityIdAndSubjectSubjectTypeIdAndLastModifiedDateTimeGreaterThan(facilityId, typeId, lastModifiedDateTime);
    }
}
