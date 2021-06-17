package org.openchs.dao.application;

import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.dao.ReferenceDataRepository;
import org.openchs.domain.EncounterType;
import org.openchs.domain.Program;
import org.openchs.domain.SubjectType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "formMapping", path = "formMapping")
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface FormMappingRepository extends ReferenceDataRepository<FormMapping>, FindByLastModifiedDateTime<FormMapping> {

    Page<FormMapping> findByProgramId(Long programId, Pageable pageable);

    List<FormMapping> findByFormId(Long formId);

    List<FormMapping> findByFormIdAndIsVoidedFalse(Long formId);

    FormMapping findByProgramIdAndEncounterTypeIdAndFormFormTypeAndSubjectTypeIdAndIsVoidedFalse(Long programId, Long encounterTypeId, FormType formType, Long subjectTypeId);

    List<FormMapping> findBySubjectTypeAndFormFormTypeAndIsVoidedFalse(SubjectType subjectType, FormType formType);
    FormMapping findBySubjectTypeNameAndFormFormTypeAndIsVoidedFalse(String subjectType, FormType formType);

    @Query("select m from FormMapping m where m.isVoided = false")
    List<FormMapping> findAllOperational();

    default FormMapping findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in FormMapping");
    }

    default FormMapping findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in FormMapping");
    }

    //    Registration
    FormMapping findBySubjectTypeAndProgramNullAndEncounterTypeNullAndIsVoidedFalse(SubjectType subjectType);
    default FormMapping getRegistrationFormMapping(SubjectType subjectType) {
        return findBySubjectTypeAndProgramNullAndEncounterTypeNullAndIsVoidedFalse(subjectType);
    }

    //    Program Enrolment
    FormMapping findBySubjectTypeAndProgramAndEncounterTypeNullAndFormFormTypeAndIsVoidedFalse(SubjectType subjectType, Program program, FormType formType);
    default FormMapping getProgramEnrolmentFormMapping(SubjectType subjectType, Program program) {
        return findBySubjectTypeAndProgramAndEncounterTypeNullAndFormFormTypeAndIsVoidedFalse(subjectType, program, FormType.ProgramEnrolment);
    }
    default FormMapping getProgramExitFormMapping(SubjectType subjectType, Program program) {
        return findBySubjectTypeAndProgramAndEncounterTypeNullAndFormFormTypeAndIsVoidedFalse(subjectType, program, FormType.ProgramExit);
    }
    List<FormMapping> findAllBySubjectTypeAndProgramNotNullAndEncounterTypeNullAndFormFormTypeAndIsVoidedFalse(SubjectType subjectType, FormType formType);
    default List<FormMapping> getAllProgramEnrolmentFormMapping(SubjectType subjectType) {
        return findAllBySubjectTypeAndProgramNotNullAndEncounterTypeNullAndFormFormTypeAndIsVoidedFalse(subjectType, FormType.ProgramEnrolment);
    }

    //    Program Encounter
    FormMapping findBySubjectTypeAndProgramAndEncounterTypeAndIsVoidedFalseAndFormFormType(SubjectType subjectType, Program program, EncounterType encounterType, FormType formType);
    default FormMapping getProgramEncounterFormMapping(SubjectType subjectType, Program program, EncounterType encounterType) {
        return findBySubjectTypeAndProgramAndEncounterTypeAndIsVoidedFalseAndFormFormType(subjectType, program, encounterType, FormType.ProgramEncounter);
    }
    default FormMapping getProgramEncounterCancelFormMapping(SubjectType subjectType, Program program, EncounterType encounterType) {
        return findBySubjectTypeAndProgramAndEncounterTypeAndIsVoidedFalseAndFormFormType(subjectType, program, encounterType, FormType.ProgramEncounterCancellation);
    }
    List<FormMapping> findAllBySubjectTypeAndProgramAndEncounterTypeNotNullAndIsVoidedFalseAndFormFormType(SubjectType subjectType, Program program, FormType formType);
    default List<FormMapping> getAllProgramEncounterFormMappings(SubjectType subjectType, Program program) {
        return findAllBySubjectTypeAndProgramAndEncounterTypeNotNullAndIsVoidedFalseAndFormFormType(subjectType, program, FormType.ProgramEncounter);
    }

    //    General Encounter
    FormMapping findBySubjectTypeAndProgramNullAndEncounterTypeAndIsVoidedFalseAndFormFormType(SubjectType subjectType, EncounterType encounterType, FormType formType);
    default FormMapping getGeneralEncounterFormMapping(SubjectType subjectType, EncounterType encounterType) {
        return findBySubjectTypeAndProgramNullAndEncounterTypeAndIsVoidedFalseAndFormFormType(subjectType, encounterType, FormType.Encounter);
    }
    default FormMapping getGeneralEncounterCancelFormMapping(SubjectType subjectType, EncounterType encounterType) {
        return findBySubjectTypeAndProgramNullAndEncounterTypeAndIsVoidedFalseAndFormFormType(subjectType, encounterType, FormType.IndividualEncounterCancellation);
    }
    List<FormMapping> findAllBySubjectTypeAndProgramNullAndEncounterTypeNotNullAndIsVoidedFalseAndFormFormType(SubjectType subjectType, FormType formType);
    default List<FormMapping> getAllGeneralEncounterFormMappings(SubjectType subjectType) {
        return findAllBySubjectTypeAndProgramNullAndEncounterTypeNotNullAndIsVoidedFalseAndFormFormType(subjectType, FormType.Encounter);
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
            "and fm.isVoided = false ")
    FormMapping getRequiredFormMapping(String subjectTypeUUID, String programUUID, String encounterTypeUUID, FormType formType);    //left join to fetch eagerly in first select

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
            "and (:subjectTypeUUID is null or fm.subjectType.uuid = :subjectTypeUUID) " +
            "and (:formType is null or f.formType = :formType) " +
            "and fm.isVoided = false ")
    List<FormMapping> findRequiredFormMappings(String subjectTypeUUID, String programUUID, String encounterTypeUUID, FormType formType);
}
