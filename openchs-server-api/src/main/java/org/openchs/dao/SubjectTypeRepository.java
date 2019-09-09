package org.openchs.dao;

import org.openchs.domain.SubjectType;
import org.openchs.domain.SubjectType.SubjectTypeProjection;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "subjectType", path = "subjectType")
public interface SubjectTypeRepository extends ReferenceDataRepository<SubjectType>, FindByLastModifiedDateTime<SubjectType> {

    @Query("select st from SubjectType st where name = 'Individual'")
    SubjectType individualSubjectType();

    @Query("select st from SubjectType st where st.operationalSubjectTypes is not empty and st.isVoided = false")
    List<SubjectTypeProjection> findAllOperational();
}