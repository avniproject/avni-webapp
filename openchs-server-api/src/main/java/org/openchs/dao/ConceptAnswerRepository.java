package org.openchs.dao;

import org.openchs.domain.Concept;
import org.openchs.domain.ConceptAnswer;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "conceptAnswer", path = "conceptAnswer")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface ConceptAnswerRepository extends PagingAndSortingRepository<ConceptAnswer, Long>, FindByLastModifiedDateTime<ConceptAnswer> {
    ConceptAnswer findByConceptAndAnswerConcept(Concept concept, Concept answerConcept);
}