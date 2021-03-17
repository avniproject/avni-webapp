package org.openchs.dao;

import org.openchs.domain.Comment;
import org.openchs.domain.Individual;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "comment", path = "comment")
public interface CommentRepository extends TransactionalDataRepository<Comment>, FindByLastModifiedDateTime<Comment> {

    List<Comment> findByIsVoidedFalseAndSubjectOrderByAuditLastModifiedDateTimeAscIdAsc(Individual subject);
}
