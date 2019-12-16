package org.openchs.dao.application;

import org.openchs.application.FormMapping;
import org.openchs.application.FormMapping.FormMappingProjection;
import org.openchs.application.FormType;
import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.dao.ReferenceDataRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "formMapping", path = "formMapping")
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface FormMappingRepository extends ReferenceDataRepository<FormMapping>, FindByLastModifiedDateTime<FormMapping> {

    Page<FormMapping> findByProgramId(Long programId, Pageable pageable);

    List<FormMapping> findByFormId(Long formId);

    List<FormMapping> findAllByProgramIdIsNotNull();

    List<FormMapping> findAllByProgramIdIsNullAndEncounterTypeIdIsNotNull();

    List<FormMapping> findAllByProgramIdIsNullAndEncounterTypeIdIsNull();

    FormMapping findByProgramIdAndEncounterTypeIdAndFormFormTypeAndIsVoidedFalse(Long programId, Long encounterTypeId, FormType formType);

    @Query("select m from FormMapping m where m.isVoided = false")
    List<FormMappingProjection> findAllOperational();

    default FormMapping findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in FormMapping");
    }

    default FormMapping findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in FormMapping");
    }

    //left join to fetch eagerly in first select
    @Query("select fm from FormMapping fm " +
            "left join fetch fm.form f " +
            "left join fetch f.formElementGroups fg " +
            "left join fetch fg.formElements fe " +
            "left join fetch fe.concept q " +
            "left join fetch q.conceptAnswers ca " +
            "left join fetch ca.answerConcept a " +
            "left join fetch fm.encounterType et " +
            "left join fetch fm.program p " +
            "left join fetch fm.subjectType s " +
            "where (:encounterTypeUUID is null or fm.encounterType.uuid = :encounterTypeUUID) " +
            "and (:programUUID is null or fm.program.uuid = :programUUID) " +
            "and fm.subjectType.uuid = :subjectTypeUUID " +
            "and f.formType = :formType " +
            "and fm.voided = false ")
    FormMapping getRequiredFormMapping(String subjectTypeUUID, String programUUID, String encounterTypeUUID, FormType formType);
}