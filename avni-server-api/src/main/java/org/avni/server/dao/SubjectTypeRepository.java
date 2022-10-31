package org.avni.server.dao;

import org.avni.server.domain.SubjectType;
import org.avni.server.domain.SubjectType.SubjectTypeProjection;
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

    List<SubjectType> findAllByIconFileS3KeyNotNull();

    List<SubjectType> findAllByUuidIn(List<String> UUIDs);

    List<SubjectType> findAllByIsVoidedFalseAndIsDirectlyAssignableTrue();
}
