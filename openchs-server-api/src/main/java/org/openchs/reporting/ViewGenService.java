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
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.Collections.singletonList;

@Service
public class ViewGenService {
    private final String ENCOUNTER_TEMPLATE;
    private final String ENCOUNTER_CANCEL_TEMPLATE;
    private final String REGISTRATION_TEMPLATE;
    private final String GENERAL_ENCOUNTER_TEMPLATE;
    private final String GENERAL_ENCOUNTER_CANCEL_TEMPLATE;
    private final String PROGRAM_ENROLMENT_TEMPLATE;
    private final String PROGRAM_ENROLMENT_EXIT_TEMPLATE;

    private final OperationalProgramRepository operationalProgramRepository;
    private final OperationalEncounterTypeRepository operationalEncounterTypeRepository;
    private final OperationalSubjectTypeRepository operationalSubjectTypeRepository;
    private final FormMappingRepository formMappingRepository;
    private final String PLACE_HOLDER_FOR_COUNSELLING_FORM_ELEMENT = "b4e5a662-97bf-4846-b9b7-9baeab4d89c4";

    @Autowired
    public ViewGenService(OperationalProgramRepository operationalProgramRepository,
                          OperationalEncounterTypeRepository operationalEncounterTypeRepository,
                          OperationalSubjectTypeRepository operationalSubjectTypeRepository,
                          FormMappingRepository formMappingRepository) throws IOException {
        this.operationalProgramRepository = operationalProgramRepository;
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        this.operationalSubjectTypeRepository = operationalSubjectTypeRepository;
        this.formMappingRepository = formMappingRepository;

        ENCOUNTER_TEMPLATE = new BufferedReader(new InputStreamReader(new ClassPathResource("/pivot/programEncounter.sql").getInputStream()))
                .lines()
                .collect(Collectors.joining("\n"));
        ENCOUNTER_CANCEL_TEMPLATE = new BufferedReader(new InputStreamReader(new ClassPathResource("/pivot/programEncounterCancel.sql").getInputStream()))
                .lines()
                .collect(Collectors.joining("\n"));
        REGISTRATION_TEMPLATE = new BufferedReader(new InputStreamReader(new ClassPathResource("/pivot/registration.sql").getInputStream()))
                .lines()
                .collect(Collectors.joining("\n"));
        GENERAL_ENCOUNTER_TEMPLATE = new BufferedReader(new InputStreamReader(new ClassPathResource("/pivot/generalEncounter.sql").getInputStream()))
                .lines()
                .collect(Collectors.joining("\n"));
        GENERAL_ENCOUNTER_CANCEL_TEMPLATE = new BufferedReader(new InputStreamReader(new ClassPathResource("/pivot/generalEncounterCancel.sql").getInputStream()))
                .lines()
                .collect(Collectors.joining("\n"));
        PROGRAM_ENROLMENT_TEMPLATE = new BufferedReader(new InputStreamReader(new ClassPathResource("/pivot/programEnrolment.sql").getInputStream()))
                .lines()
                .collect(Collectors.joining("\n"));
        PROGRAM_ENROLMENT_EXIT_TEMPLATE = new BufferedReader(new InputStreamReader(new ClassPathResource("/pivot/programEnrolmentExit.sql").getInputStream()))
                .lines()
                .collect(Collectors.joining("\n"));
    }

    public Map<String, String> registrationReport(String subjectTypeName, boolean spreadMultiSelectObs) {

        List<FormElement> registrationFormElements = getRegistrationFormElements(getOperationalSubjectType(subjectTypeName).getSubjectType().getId());

        String sql = REGISTRATION_TEMPLATE.replace("${selections}",
                buildObservationSelection("individual", registrationFormElements, spreadMultiSelectObs))
                .replace("${operationalSubjectTypeUuid}", operationalSubjectTypeRepository.findByNameIgnoreCase(subjectTypeName).getUuid())
                .replaceAll("[,\\s]+FROM", "\nFROM")
                .replaceAll("[,\\s]+,", ",");
        return new HashMap<String, String>() {{
            put("Registration", sql);
        }};

    }

    public Map<String, String> enrolmentReport(String subjectTypeName, String operationalProgramName) {
        OperationalSubjectType operationalSubjectType = getOperationalSubjectType(subjectTypeName);
        OperationalProgram operationalProgram = operationalProgramRepository.findByNameIgnoreCase(operationalProgramName);
        if (operationalProgram == null) {
            return new HashMap<>();
        }
        Long subjectTypeId = operationalSubjectType.getSubjectType().getId();
        List<FormElement> enrolmentFormElements = getProgramEnrolmentFormElements(operationalProgram, subjectTypeId);
        List<FormElement> registrationFormElements = getRegistrationFormElements(subjectTypeId);
        String enrolmentSql = replaceSubjectAndEnrolmentObsInTemplate(PROGRAM_ENROLMENT_TEMPLATE, false, operationalSubjectType.getUuid(), registrationFormElements, enrolmentFormElements, operationalProgram.getUuid())
                .replaceAll("[,\\s]+FROM", "\nFROM")
                .replaceAll("[,\\s]+,", ",");
        String enrolmentExitSql = replaceSubjectAndEnrolmentObsInTemplate(PROGRAM_ENROLMENT_EXIT_TEMPLATE, false, operationalSubjectType.getUuid(), registrationFormElements, enrolmentFormElements, operationalProgram.getUuid())
                .replace("${programEnrolmentExit}", buildExitObservationSelection(getProgramEnrolmentExitFormElements(operationalProgram, subjectTypeId)))
                .replaceAll("[,\\s]+FROM", "\nFROM")
                .replaceAll("[,\\s]+,", ",");
        return new HashMap<String, String>() {{
            put(operationalProgramName, enrolmentSql);
            put(operationalProgramName.concat(" EXIT"), enrolmentExitSql);
        }};
    }

    public Map<String, String> getSqlsFor(String operationalProgramName, String operationalEncounterTypeName, boolean spreadMultiSelectObs, String subjectTypeName) {
        OperationalSubjectType operationalSubjectType = getOperationalSubjectType(subjectTypeName);
        OperationalProgram operationalProgram = operationalProgramRepository.findByNameIgnoreCase(operationalProgramName);
        List<OperationalEncounterType> operationalEncounterTypes = operationalEncounterTypeName == null ?
                operationalEncounterTypeRepository.findAll() :
                singletonList(operationalEncounterTypeRepository.findByNameIgnoreCase(operationalEncounterTypeName));
        if (operationalProgram == null) {
            return getGeneralEncounterSqls(operationalEncounterTypes, spreadMultiSelectObs, operationalSubjectType.getSubjectType().getId(), operationalSubjectType.getUuid());
        } else if (operationalProgram.getProgram() != null) {
            return getProgramEncounterSqls(operationalProgram, operationalEncounterTypes, spreadMultiSelectObs, operationalSubjectType.getSubjectType().getId(), operationalSubjectType.getUuid());
        }
        throw new IllegalArgumentException(String.format("Not found OperationalProgram{name='%s'}", operationalProgramName));
    }

    private Map<String, String> getProgramEncounterSqls(OperationalProgram operationalProgram, List<OperationalEncounterType> types, boolean spreadMultiSelectObs, Long subjectTypeId, String operationalSubjectTypeUUID) {
        List<FormElement> registrationFormElements = getRegistrationFormElements(subjectTypeId);
        List<FormElement> enrolmentFormElements = getProgramEnrolmentFormElements(operationalProgram, subjectTypeId);

        String programEncounterQuery = replaceSubjectAndEnrolmentObsInTemplate(ENCOUNTER_TEMPLATE, spreadMultiSelectObs, operationalSubjectTypeUUID, registrationFormElements, enrolmentFormElements, operationalProgram.getUuid());
        String programEncounterCancelQuery = replaceSubjectAndEnrolmentObsInTemplate(ENCOUNTER_CANCEL_TEMPLATE, spreadMultiSelectObs, operationalSubjectTypeUUID, registrationFormElements, enrolmentFormElements, operationalProgram.getUuid());

        Map<String, String> programEncounterSqlMap = new HashMap<>();
        types.stream()
                .filter(type -> {
                    FormMapping formMapping = formMappingRepository.findByProgramIdAndEncounterTypeIdAndFormFormTypeAndSubjectTypeIdAndIsVoidedFalse(operationalProgram.getProgram().getId(), type.getEncounterType().getId(), FormType.ProgramEncounter, subjectTypeId);
                    return formMapping != null;
                })
                .forEach(type -> {
                    programEncounterSqlMap.put(type.getName(), getSqlForProgramEncounter(programEncounterQuery, type, spreadMultiSelectObs, getProgramEncounterFormElements(operationalProgram, type, subjectTypeId)));
                    programEncounterSqlMap.put(type.getName().concat(" CANCEL"), getSqlForProgramEncounterCancel(programEncounterCancelQuery, type, spreadMultiSelectObs, getProgramEncounterCancelFormElements(operationalProgram, type, subjectTypeId)));
                });
        return programEncounterSqlMap;
    }

    private String replaceSubjectAndEnrolmentObsInTemplate(String template, boolean spreadMultiSelectObs, String operationalSubjectTypeUUID, List<FormElement> registrationFormElements, List<FormElement> enrolmentFormElements, String uuid) {
        return template.replace("${operationalProgramUuid}", uuid)
                .replace("${operationalSubjectTypeUuid}", operationalSubjectTypeUUID)
                .replace("${programEnrolment}", buildObservationSelection("programEnrolment", enrolmentFormElements, spreadMultiSelectObs));
    }

    private Map<String, String> getGeneralEncounterSqls(List<OperationalEncounterType> types, boolean spreadMultiSelectObs, Long subjectTypeId, String operationalSubjectTypeUUID) {
        String generalEncounterQuery = replaceSubjectTypeUUID(GENERAL_ENCOUNTER_TEMPLATE, operationalSubjectTypeUUID);
        String generalEncounterCancelQuery = replaceSubjectTypeUUID(GENERAL_ENCOUNTER_CANCEL_TEMPLATE, operationalSubjectTypeUUID);
        Map<String, String> generalEncounterSqlMap = new HashMap<>();
        types.stream()
                .filter(type -> {
                    FormMapping formMapping = formMappingRepository.findByProgramIdAndEncounterTypeIdAndFormFormTypeAndSubjectTypeIdAndIsVoidedFalse(null, type.getEncounterType().getId(), FormType.Encounter, subjectTypeId);
                    return formMapping != null;
                })
                .forEach(type -> {
                    generalEncounterSqlMap.put(type.getName(), getSqlForGeneralEncounter(generalEncounterQuery, type, spreadMultiSelectObs, getGeneralEncounterFormElements(subjectTypeId, type)));
                    generalEncounterSqlMap.put(type.getName().concat(" CANCEL"), getSqlForGeneralEncounterCancel(generalEncounterCancelQuery, type, spreadMultiSelectObs, getGeneralEncounterCancelFormElements(subjectTypeId, type)));
                });
        return generalEncounterSqlMap;
    }

    private String replaceSubjectTypeUUID(String template, String operationalSubjectTypeUUID) {
        return template.replace("${operationalSubjectTypeUuid}", operationalSubjectTypeUUID);
    }

    private String getSqlForProgramEncounter(String mainViewQuery, OperationalEncounterType operationalEncounterType, boolean spreadMultiSelectObs, List<FormElement> formElements) {
        return mainViewQuery
                .replace("${operationalEncounterTypeUuid}", operationalEncounterType.getUuid())
                .replace("${programEncounter}", buildObservationSelection("programEncounter", formElements, spreadMultiSelectObs))
                .replaceAll("[,\\s]+FROM", "\nFROM")
                .replaceAll("[,\\s]+,", ",");
    }

    private String getSqlForProgramEncounterCancel(String mainViewQuery, OperationalEncounterType operationalEncounterType, boolean spreadMultiSelectObs, List<FormElement> cancelFormElements) {
        return mainViewQuery
                .replace("${operationalEncounterTypeUuid}", operationalEncounterType.getUuid())
                .replace("${programEncounterCancellation}", buildCancelObservationSelection("programEncounter", cancelFormElements, spreadMultiSelectObs))
                .replaceAll("[,\\s]+FROM", "\nFROM")
                .replaceAll("[,\\s]+,", ",");
    }

    private String getSqlForGeneralEncounter(String mainViewQuery, OperationalEncounterType operationalEncounterType, boolean spreadMultiSelectObs, List<FormElement> formElements) {
        return mainViewQuery
                .replace("${encounterTypeUuid}", operationalEncounterType.getUuid())
                .replace("${encounter}", buildObservationSelection("encounter", formElements, spreadMultiSelectObs))
                .replaceAll("[,\\s]+FROM", "\nFROM")
                .replaceAll("[,\\s]+,", ",");
    }

    private String getSqlForGeneralEncounterCancel(String mainViewQuery, OperationalEncounterType operationalEncounterType, boolean spreadMultiSelectObs, List<FormElement> cancelFormElements) {
        return mainViewQuery
                .replace("${encounterTypeUuid}", operationalEncounterType.getUuid())
                .replace("${encounterCancellation}", buildCancelObservationSelection("encounter", cancelFormElements, spreadMultiSelectObs))
                .replaceAll("[,\\s]+FROM", "\nFROM")
                .replaceAll("[,\\s]+,", ",");
    }

    private List<FormElement> getRegistrationFormElements(Long subjectTypeId) {
        return getFormElements(null, null, FormType.IndividualProfile, subjectTypeId);
    }

    private List<FormElement> getProgramEnrolmentFormElements(OperationalProgram operationalProgram, Long subjectTypeId) {
        return getFormElements(operationalProgram.getProgram().getId(), null, FormType.ProgramEnrolment, subjectTypeId);
    }

    private List<FormElement> getProgramEnrolmentExitFormElements(OperationalProgram operationalProgram, Long subjectTypeId) {
        return getFormElements(operationalProgram.getProgram().getId(), null, FormType.ProgramExit, subjectTypeId);
    }

    private List<FormElement> getGeneralEncounterFormElements(Long subjectTypeId, OperationalEncounterType type) {
        return getFormElements(null, type.getEncounterType().getId(), FormType.Encounter, subjectTypeId);
    }

    private List<FormElement> getGeneralEncounterCancelFormElements(Long subjectTypeId, OperationalEncounterType type) {
        return getFormElements(null, type.getEncounterType().getId(), FormType.IndividualEncounterCancellation, subjectTypeId);
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

    private String buildObservationSelection(String entity, List<FormElement> elements, boolean spreadMultiSelectObs) {
        return buildObservationSelection(entity, elements, spreadMultiSelectObs, "observations");
    }

    private String buildCancelObservationSelection(String entity, List<FormElement> elements, boolean spreadMultiSelectObs) {
        return buildObservationSelection(entity, elements, spreadMultiSelectObs, "cancel_observations");
    }

    private String buildExitObservationSelection(List<FormElement> elements) {
        return buildObservationSelection("programEnrolment", elements, false, "program_exit_observations");
    }

    private String buildObservationSelection(String entity, List<FormElement> elements, Boolean spreadMultiSelectObs, String obsColumnName) {
        String obsColumn = entity + "." + obsColumnName;
        return elements.parallelStream().map(formElement -> {
            Concept concept = formElement.getConcept();
            String conceptUUID = concept.getUuid();
            String conceptName = concept.getName();
            switch (ConceptDataType.valueOf(concept.getDataType())) {
                case Coded: {
                    if (formElement.isSingleSelect()) {
                        return String.format("single_select_coded(%s->>'%s')::TEXT as \"%s\"",
                                obsColumn, conceptUUID, conceptName);
                    }
                    if (spreadMultiSelectObs) {
                        return spreadMultiSelectSQL(obsColumn, concept);
                    }
                    return String.format("multi_select_coded(%s->'%s')::TEXT as \"%s\"",
                            obsColumn, conceptUUID, conceptName);
                }
                case Date:
                case DateTime: {
                    return String.format("(%s->>'%s')::DATE as \"%s\"", obsColumn, conceptUUID, conceptName);
                }
                case Numeric: {
                    return String.format("(%s->>'%s')::NUMERIC as \"%s\"", obsColumn, conceptUUID, conceptName);
                }
                default: {
                    return String.format("(%s->>'%s')::TEXT as \"%s\"", obsColumn, conceptUUID, conceptName);
                }
            }
        }).collect(Collectors.joining(",\n"));
    }

    private String spreadMultiSelectSQL(String obsColumn, Concept concept) {
        String obsSubColumn = String.format("(%s->'%s')", obsColumn, concept.getUuid());
        return concept.getConceptAnswers().stream().map(ConceptAnswer::getAnswerConcept)
                .map(aConcept -> String.format("boolean_txt(%s ? '%s') as \"%s(%s)\"",
                        obsSubColumn, aConcept.getUuid(), aConcept.getName(), concept.getName()))
                .collect(Collectors.joining(",\n"));
    }

    private OperationalSubjectType getOperationalSubjectType(String subjectTypeName) {
        OperationalSubjectType operationalSubjectType = operationalSubjectTypeRepository.findByNameIgnoreCase(subjectTypeName);

        if (operationalSubjectType != null) {
            return operationalSubjectType;
        } else {
            throw new IllegalArgumentException(String.format("Not found operationalSubject{name='%s'}", subjectTypeName));
        }
    }
}
