package org.avni.server.dao;

import java.util.ArrayList;

import org.avni.server.domain.Comment;
import org.avni.server.domain.CommentThread;
import org.avni.server.domain.Individual;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.*;
import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "commentThread", path = "commentThread", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface CommentThreadRepository extends TransactionalDataRepository<CommentThread>, FindByLastModifiedDateTime<CommentThread>, OperatingIndividualScopeAwareRepository<CommentThread> {

    @Override
    default Page<CommentThread> getSyncResults(SyncParameters syncParameters) {
        return findAll(syncAuditSpecification(syncParameters)
                        .and(syncStrategySpecification(syncParameters)),
                syncParameters.getPageable());
    }

    default Specification<CommentThread> syncStrategySpecification(SyncParameters syncParameters) {
        return (Root<CommentThread> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<CommentThread, Comment> commentJoin = root.join("comments", JoinType.LEFT);
            Join<Comment, Individual> individualJoin = commentJoin.join("subject");
            predicates.add(cb.equal(individualJoin.get("subjectType").get("id"), syncParameters.getTypeId()));
            addSyncStrategyPredicates(syncParameters, cb, predicates, individualJoin);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    default boolean isEntityChangedForCatchment(SyncParameters syncParameters){
        return count(syncEntityChangedAuditSpecification(syncParameters)
                .and(syncStrategySpecification(syncParameters))
        ) > 0;
    }

    List<CommentThread> findDistinctByIsVoidedFalseAndCommentsIsVoidedFalseAndComments_SubjectOrderByOpenDateTimeDescIdDesc(Individual subject);
}
