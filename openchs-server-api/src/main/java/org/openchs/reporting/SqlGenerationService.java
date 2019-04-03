package org.openchs.reporting;

import org.openchs.application.FormElement;
import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.OperationalEncounterTypeRepository;
import org.openchs.dao.OperationalProgramRepository;
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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.Collections.singletonList;

@Service
public class SqlGenerationService {
    private final String VIEW_TEMPLATE;

    private final OperationalProgramRepository operationalProgramRepository;
    private final OperationalEncounterTypeRepository operationalEncounterTypeRepository;
    private final FormMappingRepository formMappingRepository;
    private final String PLACE_HOLDER_FOR_COUNSELLING_FORM_ELEMENT = "b4e5a662-97bf-4846-b9b7-9baeab4d89c4";

    @Autowired
    public SqlGenerationService(OperationalProgramRepository operationalProgramRepository, OperationalEncounterTypeRepository operationalEncounterTypeRepository, FormMappingRepository formMappingRepository) throws IOException {
        this.operationalProgramRepository = operationalProgramRepository;
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        this.formMappingRepository = formMappingRepository;

        VIEW_TEMPLATE = new BufferedReader(new InputStreamReader(new ClassPathResource("/pivot/pivot.sql").getInputStream()))
                .lines()
                .collect(Collectors.joining("\n"));
    }

    public Map<String, String> getSqlsFor(String operationalProgramName, String operationalEncounterTypeName) {
        OperationalProgram operationalProgram = operationalProgramRepository.findByNameIgnoreCase(operationalProgramName);
        List<OperationalEncounterType> operationalEncounterTypes = operationalEncounterTypeName == null ?
                operationalEncounterTypeRepository.findAll() :
                singletonList(operationalEncounterTypeRepository.findByNameIgnoreCase(operationalEncounterTypeName));
        if (operationalProgram != null && operationalProgram.getProgram() != null) {
            return getSqlsFor(operationalProgram, operationalEncounterTypes);
        }
        throw new IllegalArgumentException(String.format("Not found OperationalProgram{name='%s'}", operationalProgramName));
    }

    private Map<String, String> getSqlsFor(OperationalProgram operationalProgram, List<OperationalEncounterType> types) {
        List<FormElement> registrationFormElements = getRegistrationFormElements();
        List<FormElement> enrolmentFormElements = getProgramEnrolmentFormElements(operationalProgram);

        String mainViewQuery = VIEW_TEMPLATE.replace("${operationalProgramUuid}", operationalProgram.getUuid())
                .replace("${individual}", buildObservationSelection("individual", registrationFormElements, "Ind"))
                .replace("${programEnrolment}", buildObservationSelection("programEnrolment", enrolmentFormElements, "Enl"));

        return types.stream()
                .map(type -> new SimpleEntry<>(type, getProgramEncounterFormElements(operationalProgram, type)))
                .filter(pair -> !pair.getValue().isEmpty())
                .map(pair -> {
                    OperationalEncounterType type = pair.getKey();
                    List<FormElement> formElements = pair.getValue();
                    List<FormElement> cancelFormElements = getProgramEncounterCancelFormElements(operationalProgram, type);
                    return new SimpleEntry<>(type.getName(), getSqlForProgramEncounter(mainViewQuery, type, formElements, cancelFormElements));
                }).collect(Collectors.toMap(SimpleEntry::getKey, SimpleEntry::getValue));
    }

    private String getSqlForProgramEncounter(String mainViewQuery, OperationalEncounterType operationalEncounterType, List<FormElement> formElements, List<FormElement> cancelFormElements) {
        return mainViewQuery
                .replace("${operationalEncounterTypeUuid}", operationalEncounterType.getUuid())
                .replace("${programEncounter}", buildObservationSelection("programEncounter", formElements, "Enc"))
                .replace("${programEncounterCancellation}", buildObservationSelection("programEncounter", cancelFormElements, "EncCancel", true));
    }

    private List<FormElement> getRegistrationFormElements() {
        return getFormElements(null, null, FormType.IndividualProfile);
    }

    private List<FormElement> getProgramEnrolmentFormElements(OperationalProgram operationalProgram) {
        return getFormElements(operationalProgram.getProgram().getId(), null, FormType.ProgramEnrolment);
    }

    private List<FormElement> getProgramEncounterFormElements(OperationalProgram operationalProgram, OperationalEncounterType type) {
        return getFormElements(operationalProgram.getProgram().getId(), type.getEncounterType().getId(), FormType.ProgramEncounter);
    }

    private List<FormElement> getProgramEncounterCancelFormElements(OperationalProgram operationalProgram, OperationalEncounterType type) {
        return getFormElements(operationalProgram.getProgram().getId(), type.getEncounterType().getId(), FormType.ProgramEncounterCancellation);
    }

    private List<FormElement> getFormElements(Long programId, Long typeId, FormType formType) {
        FormMapping formMapping = formMappingRepository.findByEntityIdAndObservationsTypeEntityIdAndFormFormTypeAndIsVoidedFalse(programId, typeId, formType);
        List<FormElement> formElements = formMapping == null ? Collections.EMPTY_LIST : formMapping.getForm().getApplicableFormElements();
        return formElements.stream().filter(fe -> !PLACE_HOLDER_FOR_COUNSELLING_FORM_ELEMENT.equals(fe.getConcept().getUuid())).collect(Collectors.toList());
    }

    private String buildObservationSelection(String entity, List<FormElement> elements, String columnPrefix) {
        return buildObservationSelection(entity, elements, columnPrefix, false);
    }

    private String buildObservationSelection(String entity, List<FormElement> elements, String columnPrefix, Boolean forCancelled) {
        Boolean multiSelectInOneColumn = true;//get it from web request param. Default value is true.
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
                    if (multiSelectInOneColumn) {
                        return String.format("multi_select_coded(%s->'%s')::TEXT as \"%s.%s\"",
                                obsColumn, conceptUUID, columnPrefix, conceptName);
                    }
                    return spreadMultiSelectSQL(obsColumn, concept, columnPrefix);
                }
                case Duration: {
                    String valueSQL = String.format("((%s->>'%s')::JSONB#>> '{durations,0,_durationValue}')", obsColumn, conceptUUID);
                    String unitSQL = String.format("((%s->>'%s')::JSONB#>>'{durations,0,durationUnit}')", obsColumn, conceptUUID);
                    return String.format("( %s || ' ' || %s )::TEXT as \"%s.%s\"", valueSQL, unitSQL, columnPrefix, conceptName);
                }
                default: {
                    return String.format("(%s->>'%s')::TEXT as \"%s.%s\"", obsColumn, conceptUUID, columnPrefix, conceptName);
                }
            }
        }).collect(Collectors.joining(","));
    }

    private String spreadMultiSelectSQL(String obsColumn, Concept concept, String columnPrefix) {
        //TOBEDONE
        return null;
    }
}
