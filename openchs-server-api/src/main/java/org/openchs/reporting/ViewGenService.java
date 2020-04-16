package org.openchs.reporting;

import org.openchs.application.FormElement;
import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.OperationalEncounterTypeRepository;
import org.openchs.dao.OperationalProgramRepository;
import org.openchs.dao.OperationalSubjectTypeRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.AbstractMap.SimpleEntry;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.Collections.singletonList;

@Service
public class ViewGenService {
    private final String ENCOUNTER_TEMPLATE;
    private final String REGISTRATION_TEMPLATE;

    private final OperationalProgramRepository operationalProgramRepository;
    private final OperationalEncounterTypeRepository operationalEncounterTypeRepository;
    private final OperationalSubjectTypeRepository operationalSubjectTypeRepository;
    private final FormMappingRepository formMappingRepository;
    private final String PLACE_HOLDER_FOR_COUNSELLING_FORM_ELEMENT = "b4e5a662-97bf-4846-b9b7-9baeab4d89c4";

    @Autowired
    public ViewGenService(OperationalProgramRepository operationalProgramRepository, OperationalEncounterTypeRepository operationalEncounterTypeRepository, OperationalSubjectTypeRepository operationalSubjectTypeRepository, FormMappingRepository formMappingRepository) throws IOException {
        this.operationalProgramRepository = operationalProgramRepository;
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        this.operationalSubjectTypeRepository = operationalSubjectTypeRepository;
        this.formMappingRepository = formMappingRepository;

        ENCOUNTER_TEMPLATE = new BufferedReader(new InputStreamReader(new ClassPathResource("/pivot/pivot.sql").getInputStream()))
                .lines()
                .collect(Collectors.joining("\n"));
        REGISTRATION_TEMPLATE = new BufferedReader(new InputStreamReader(new ClassPathResource("/pivot/registration.sql").getInputStream()))
                .lines()
                .collect(Collectors.joining("\n"));
    }

    public Map<String, String> registrationReport(String subjectType, boolean spreadMultiSelectObs) {

            List<FormElement> registrationFormElements = getRegistrationFormElements(getSubjectTypeId(subjectType));

            String sql = REGISTRATION_TEMPLATE.replace("${selections}",
                    buildObservationSelection("individual", registrationFormElements, "Ind", spreadMultiSelectObs));
            return new HashMap<String, String>() {{
                put("Registration", sql);
            }};

    }

    public Map<String, String> getSqlsFor(String operationalProgramName, String operationalEncounterTypeName, boolean spreadMultiSelectObs, String subjectTypeName) {
        Long subjectTypeId = getSubjectTypeId(subjectTypeName);
        OperationalProgram operationalProgram = operationalProgramRepository.findByNameIgnoreCase(operationalProgramName);
        List<OperationalEncounterType> operationalEncounterTypes = operationalEncounterTypeName == null ?
                operationalEncounterTypeRepository.findAll() :
                singletonList(operationalEncounterTypeRepository.findByNameIgnoreCase(operationalEncounterTypeName));
        if (operationalProgram != null && operationalProgram.getProgram() != null) {
            return getSqlsFor(operationalProgram, operationalEncounterTypes, spreadMultiSelectObs, subjectTypeId);
        }
        throw new IllegalArgumentException(String.format("Not found OperationalProgram{name='%s'}", operationalProgramName));
    }

    private Map<String, String> getSqlsFor(OperationalProgram operationalProgram, List<OperationalEncounterType> types, boolean spreadMultiSelectObs, Long subjectTypeId) {
        List<FormElement> registrationFormElements = getRegistrationFormElements(subjectTypeId);
        List<FormElement> enrolmentFormElements = getProgramEnrolmentFormElements(operationalProgram, subjectTypeId);

        String mainViewQuery = ENCOUNTER_TEMPLATE.replace("${operationalProgramUuid}", operationalProgram.getUuid())
                .replace("${individual}", buildObservationSelection("individual", registrationFormElements, "Ind", spreadMultiSelectObs))
                .replace("${programEnrolment}", buildObservationSelection("programEnrolment", enrolmentFormElements, "Enl", spreadMultiSelectObs));

        return types.stream()
                .map(type -> new SimpleEntry<>(type, getProgramEncounterFormElements(operationalProgram, type, subjectTypeId)))
                .filter(pair -> !pair.getValue().isEmpty())
                .map(pair -> {
                    OperationalEncounterType type = pair.getKey();
                    List<FormElement> formElements = pair.getValue();
                    List<FormElement> cancelFormElements = getProgramEncounterCancelFormElements(operationalProgram, type, subjectTypeId);
                    return new SimpleEntry<>(type.getName(), getSqlForProgramEncounter(mainViewQuery, type, spreadMultiSelectObs,  formElements, cancelFormElements));
                }).collect(Collectors.toMap(SimpleEntry::getKey, SimpleEntry::getValue));
    }

    private String getSqlForProgramEncounter(String mainViewQuery, OperationalEncounterType operationalEncounterType, boolean spreadMultiSelectObs, List<FormElement> formElements, List<FormElement> cancelFormElements) {
        return mainViewQuery
                .replace("${operationalEncounterTypeUuid}", operationalEncounterType.getUuid())
                .replace("${programEncounter}", buildObservationSelection("programEncounter", formElements, "Enc", spreadMultiSelectObs))
                .replace("${programEncounterCancellation}", buildObservationSelection("programEncounter", cancelFormElements, "EncCancel", true));
    }

    private List<FormElement> getRegistrationFormElements(Long subjectTypeId) {
        return getFormElements(null, null, FormType.IndividualProfile, subjectTypeId);
    }

    private List<FormElement> getProgramEnrolmentFormElements(OperationalProgram operationalProgram, Long subjectTypeId) {
        return getFormElements(operationalProgram.getProgram().getId(), null, FormType.ProgramEnrolment, subjectTypeId);
    }

    private List<FormElement> getProgramEncounterFormElements(OperationalProgram operationalProgram, OperationalEncounterType type, Long subjectTypeId) {
        return getFormElements(operationalProgram.getProgram().getId(), type.getEncounterType().getId(), FormType.ProgramEncounter, subjectTypeId);
    }

    private List<FormElement> getProgramEncounterCancelFormElements(OperationalProgram operationalProgram, OperationalEncounterType type, Long subjectTypeId) {
        return getFormElements(operationalProgram.getProgram().getId(), type.getEncounterType().getId(), FormType.ProgramEncounterCancellation, subjectTypeId);
    }

    private List<FormElement> getFormElements(Long programId, Long typeId, FormType formType, Long subjectTypeId) {
        FormMapping formMapping = formMappingRepository.findByProgramIdAndEncounterTypeIdAndFormFormTypeAndSubjectTypeIdAndIsVoidedFalse(programId, typeId, formType, subjectTypeId);
        List<FormElement> formElements = formMapping == null ? Collections.EMPTY_LIST : formMapping.getForm().getApplicableFormElements();
        return formElements.stream().filter(fe -> !PLACE_HOLDER_FOR_COUNSELLING_FORM_ELEMENT.equals(fe.getConcept().getUuid())).collect(Collectors.toList());
    }

    private String buildObservationSelection(String entity, List<FormElement> elements, String columnPrefix, boolean spreadMultiSelectObs) {
        return buildObservationSelection(entity, elements, columnPrefix, spreadMultiSelectObs, false);
    }

    private String buildObservationSelection(String entity, List<FormElement> elements, String columnPrefix, Boolean spreadMultiSelectObs, Boolean forCancelled) {
        String obsColumn = entity + (forCancelled ? ".cancel_observations" : ".observations");
        return elements.parallelStream().map(formElement -> {
            Concept concept = formElement.getConcept();
            String conceptUUID = concept.getUuid();
            String conceptName = concept.getName();
            switch (ConceptDataType.valueOf(concept.getDataType())) {
                case Coded: {
                    if (formElement.isSingleSelect()) {
                        return String.format("single_select_coded(%s->>'%s')::TEXT as \"%s.%s\"",
                                obsColumn, conceptUUID, columnPrefix, conceptName);
                    }
                    if (spreadMultiSelectObs) {
                        return spreadMultiSelectSQL(obsColumn, concept, columnPrefix);
                    }
                    return String.format("multi_select_coded(%s->'%s')::TEXT as \"%s.%s\"",
                            obsColumn, conceptUUID, columnPrefix, conceptName);
                }
                case Date: case DateTime: {
                    return String.format("(%s->>'%s')::DATE as \"%s.%s\"", obsColumn, conceptUUID, columnPrefix, conceptName);
                }
                default: {
                    return String.format("(%s->>'%s')::TEXT as \"%s.%s\"", obsColumn, conceptUUID, columnPrefix, conceptName);
                }
            }
        }).collect(Collectors.joining(",\n"));
    }

    private String spreadMultiSelectSQL(String obsColumn, Concept concept, String columnPrefix) {
        String obsSubColumn = String.format("(%s->'%s')", obsColumn, concept.getUuid());
        return concept.getConceptAnswers().stream().map(ConceptAnswer::getAnswerConcept)
                .map(aConcept -> String.format("boolean_txt(%s ? '%s') as \"%s.%s(%s)\"",
                        obsSubColumn, aConcept.getUuid(), columnPrefix, aConcept.getName(), concept.getName()))
                .collect(Collectors.joining(",\n"));
    }

    private Long getSubjectTypeId (String subjectTypeName) {
        OperationalSubjectType operationalSubjectType = operationalSubjectTypeRepository.findByNameIgnoreCase(subjectTypeName);

        if(operationalSubjectType != null && operationalSubjectType.getSubjectType() != null) {
            return operationalSubjectType.getSubjectType().getId();
        } else {
            throw new IllegalArgumentException(String.format("Not found operationalSubject{name='%s'}", subjectTypeName));
        }
    }
}
