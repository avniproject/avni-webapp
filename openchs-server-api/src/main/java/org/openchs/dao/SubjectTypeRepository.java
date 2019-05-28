package org.openchs.dao;

import org.openchs.domain.SubjectType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "subjectType", path = "subjectType")
public interface SubjectTypeRepository extends ReferenceDataRepository<SubjectType>, FindByLastModifiedDateTime<SubjectType> {

    @Query("select st from SubjectType st where name = 'Individual'")
    SubjectType individualSubjectType();
}