package org.avni.dao;

import org.avni.domain.AddressLevel;
import org.avni.domain.CommentThread;
import org.avni.domain.Individual;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import org.joda.time.DateTime;
import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "commentThread", path = "commentThread", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface CommentThreadRepository extends TransactionalDataRepository<CommentThread>, FindByLastModifiedDateTime<CommentThread>, OperatingIndividualScopeAwareRepository<CommentThread> {

    Page<CommentThread> findByComments_SubjectAddressLevelInAndComments_SubjectSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            List<AddressLevel> addressLevels,
            Long subjectTypeId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    Page<CommentThread> findByComments_SubjectFacilityIdAndComments_SubjectSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long facilityId,
            Long subjectTypeId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    boolean existsByComments_SubjectSubjectTypeIdAndLastModifiedDateTimeGreaterThanAndComments_SubjectAddressLevelIdIn(
            Long subjectTypeId,
            DateTime lastModifiedDateTime,
            List<Long> addressIds);

    boolean existsByComments_SubjectFacilityIdAndComments_SubjectSubjectTypeIdAndLastModifiedDateTimeGreaterThan(
            long facilityId,
            Long subjectTypeId,
            DateTime lastModifiedDateTime);


    @Override
    default Page<CommentThread> syncByCatchment(SyncParameters syncParameters) {
        return findByComments_SubjectAddressLevelInAndComments_SubjectSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime(), syncParameters.getNow(), syncParameters.getPageable());
    }

    @Override
    default Page<CommentThread> syncByFacility(SyncParameters syncParameters) {
        return findByComments_SubjectFacilityIdAndComments_SubjectSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getCatchmentId(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime(), syncParameters.getNow(), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(List<Long> addressIds, DateTime lastModifiedDateTime, Long typeId){
        return existsByComments_SubjectSubjectTypeIdAndLastModifiedDateTimeGreaterThanAndComments_SubjectAddressLevelIdIn(typeId, lastModifiedDateTime, addressIds);
    }

    @Override
    default boolean isEntityChangedForFacility(long facilityId, DateTime lastModifiedDateTime, Long typeId){
        return existsByComments_SubjectFacilityIdAndComments_SubjectSubjectTypeIdAndLastModifiedDateTimeGreaterThan(facilityId, typeId, lastModifiedDateTime);
    }

    List<CommentThread> findDistinctByIsVoidedFalseAndCommentsIsVoidedFalseAndComments_SubjectOrderByOpenDateTimeDescIdDesc(Individual subject);
}
