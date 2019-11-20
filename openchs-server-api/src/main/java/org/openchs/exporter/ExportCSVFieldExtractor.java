package org.openchs.exporter;

import org.openchs.application.FormElement;
import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.EncounterRepository;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramEncounterRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.*;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.file.FlatFileHeaderCallback;
import org.springframework.batch.item.file.transform.FieldExtractor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Component
@StepScope
public class ExportCSVFieldExtractor implements FieldExtractor<ExportItemRow>, FlatFileHeaderCallback {

    private static final String selectedAnswerFieldValue = "1";
    private static final String unSelectedAnswerFieldValue = "0";

    @Value("#{jobParameters['encounterTypeUUID']}")
    private String encounterTypeUUID;

    @Value("#{jobParameters['subjectTypeUUID']}")
    private String subjectTypeUUID;

    @Value("#{jobParameters['programUUID']}")
    private String programUUID;

    private FormMappingRepository formMappingRepository;
    private EncounterTypeRepository encounterTypeRepository;
    private EncounterRepository encounterRepository;
    private ProgramEncounterRepository programEncounterRepository;

    private LinkedHashMap<String, FormElement> registrationMap;
    private LinkedHashMap<String, FormElement> enrolmentMap;
    private LinkedHashMap<String, FormElement> exitEnrolmentMap;
    private LinkedHashMap<String, FormElement> programEncounterMap;
    private LinkedHashMap<String, FormElement> encounterMap;
    private String encounterTypeName;
    private Long maxVisitCount;

    public ExportCSVFieldExtractor(FormMappingRepository formMappingRepository, EncounterTypeRepository encounterTypeRepository,
                                   EncounterRepository encounterRepository, ProgramEncounterRepository programEncounterRepository) {
        this.formMappingRepository = formMappingRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.encounterRepository = encounterRepository;
        this.programEncounterRepository = programEncounterRepository;
    }

    @PostConstruct
    public void init() {
        FormMapping programEncounterFormMapping = formMappingRepository.findByEncounterType_UuidAndProgram_UuidAndIsVoidedFalseAndSubjectType_UuidAndForm_FormType(encounterTypeUUID, programUUID, subjectTypeUUID, FormType.ProgramEncounter);
        FormMapping registrationFormMapping = formMappingRepository.findBySubjectType_UuidAndForm_FormType(subjectTypeUUID, FormType.IndividualProfile);
        FormMapping programEnrolmentFormMapping = formMappingRepository.findByProgram_UuidAndSubjectType_UuidAndForm_FormType(programUUID, subjectTypeUUID, FormType.ProgramEnrolment);
        FormMapping programEnrolmentExitFormMapping = formMappingRepository.findByProgram_UuidAndSubjectType_UuidAndForm_FormType(programUUID, subjectTypeUUID, FormType.ProgramEnrolment);
        FormMapping encounterFormMapping = formMappingRepository.findByEncounterType_UuidAndSubjectType_UuidAndForm_FormType(encounterTypeUUID, subjectTypeUUID, FormType.Encounter);
        this.registrationMap = getEntityConceptMap(registrationFormMapping);
        this.enrolmentMap = getEntityConceptMap(programEnrolmentFormMapping);
        this.exitEnrolmentMap = getEntityConceptMap(programEnrolmentExitFormMapping);
        this.programEncounterMap = getEntityConceptMap(programEncounterFormMapping);
        this.encounterMap = getEntityConceptMap(encounterFormMapping);
        this.encounterTypeName = encounterTypeRepository.getEncounterTypeName(encounterTypeUUID);
        this.maxVisitCount = programUUID == null ? encounterRepository.getMaxEncounterCount(encounterTypeUUID) :
                programEncounterRepository.getMaxProgramEncounterCount(encounterTypeUUID);
    }

    private LinkedHashMap<String, FormElement> getEntityConceptMap(FormMapping formMapping) {
        List<FormElement> formElements = formMapping == null ? Collections.emptyList() : formMapping.getForm().getApplicableFormElements();
        return formElements.stream().collect(Collectors.toMap(f -> f.getConcept().getUuid(), f -> f, (a, b) -> b, LinkedHashMap::new));
    }

    @Override
    public Object[] extract(ExportItemRow exportItemRow) {
        List<Object> row = new ArrayList<>();

        //Registration
        row.add(exportItemRow.getIndividual().getId());
        row.add(exportItemRow.getIndividual().getUuid());
        row.add(exportItemRow.getIndividual().getFirstName());
        row.add(exportItemRow.getIndividual().getLastName());
        row.add(exportItemRow.getIndividual().getDateOfBirth());
        row.add(exportItemRow.getIndividual().getRegistrationDate());
        row.add(exportItemRow.getIndividual().getGender().getName());
        row.add(exportItemRow.getIndividual().getAddressLevel().getTitle());
        row.addAll(getObs(exportItemRow.getIndividual().getObservations(), registrationMap));
        if (programUUID == null) {
            addGeneralEncounterRelatedFields(exportItemRow, row);
        } else {
            addProgramEnrolmentFields(exportItemRow, row);
            addProgramEncounterRelatedFields(exportItemRow, row);
        }
        return row.toArray();
    }

    private void addProgramEnrolmentFields(ExportItemRow exportItemRow, List<Object> row) {
        //ProgramEnrolment
        row.add(exportItemRow.getProgramEnrolment().getId());
        row.add(exportItemRow.getProgramEnrolment().getUuid());
        row.add(exportItemRow.getProgramEnrolment().getEnrolmentDateTime());
        row.addAll(getObs(exportItemRow.getProgramEnrolment().getObservations(), enrolmentMap));
        //Program Exit
        row.add(exportItemRow.getProgramEnrolment().getProgramExitDateTime());
        row.addAll(getObs(exportItemRow.getProgramEnrolment().getProgramExitObservations(), exitEnrolmentMap));
    }

    private void addGeneralEncounterRelatedFields(ExportItemRow exportItemRow, List<Object> row) {
        //Encounter
        for (Encounter encounter : exportItemRow.getEncounters())
            addEncounter(row, encounter, encounterMap);
    }

    private void addProgramEncounterRelatedFields(ExportItemRow exportItemRow, List<Object> row) {
        //ProgramEncounter
        for (ProgramEncounter programEncounter : exportItemRow.getProgramEncounters())
            addEncounter(row, programEncounter, programEncounterMap);
    }

    private <T extends AbstractEncounter> void addEncounter(List<Object> row, T encounter, LinkedHashMap<String, FormElement> map) {
        row.add(encounter.getId());
        row.add(encounter.getUuid());
        row.add(encounter.getEarliestVisitDateTime());
        row.add(encounter.getMaxVisitDateTime());
        row.add(encounter.getEncounterDateTime());
        row.addAll(getObs(encounter.getObservations(), map));
    }

    @Override
    public void writeHeader(Writer writer) throws IOException {
        writer.write(getHeader());
    }

    private String getHeader() {
        StringBuilder sb = new StringBuilder();
        //Registration
        sb.append("ind.id");
        sb.append(",").append("ind.uuid");
        sb.append(",").append("ind.first_name");
        sb.append(",").append("ind.last_name");
        sb.append(",").append("ind.date_of_birth");
        sb.append(",").append("ind.registration_date");
        sb.append(",").append("ind.gender");
        sb.append(",").append("ind.area");
        appendObsColumns(sb, "ind", registrationMap);

        if (programUUID != null) {
            //ProgramEnrolment
            sb.append(",").append("enl.id");
            sb.append(",").append("enl.uuid");
            sb.append(",").append("enl.enrolment_date_time");
            appendObsColumns(sb, "enl", enrolmentMap);
            sb.append(",").append("enl.program_exit_date_time");
            appendObsColumns(sb, "enl_exit", exitEnrolmentMap);
        }

        //Encounter
        int visit = 0;
        while (visit < maxVisitCount) {
            visit++;
            sb.append(",").append(encounterTypeName).append("_").append(visit).append(".id");
            sb.append(",").append(encounterTypeName).append("_").append(visit).append(".uuid");
            sb.append(",").append(encounterTypeName).append("_").append(visit).append(".earliest_visit_date_time");
            sb.append(",").append(encounterTypeName).append("_").append(visit).append(".max_visit_date_time");
            sb.append(",").append(encounterTypeName).append("_").append(visit).append(".encounter_date_time");
            appendObsColumns(sb, encounterTypeName + "_" + visit, programUUID != null ? programEncounterMap : encounterMap);
        }
        return sb.toString();
    }

    private void appendObsColumns(StringBuilder sb, String prefix, LinkedHashMap<String, FormElement> map) {
        map.forEach((uuid, fe) -> {
            Concept concept = fe.getConcept();
            if (concept.getDataType().equals(ConceptDataType.Coded.toString())) {
                concept.getSortedAnswers().map(ca -> ca.getAnswerConcept().getName()).forEach(can ->
                        sb.append(",")
                                .append(prefix)
                                .append("_")
                                .append(massageStringValue(concept.getName()))
                                .append("_").append(massageStringValue(can)));
            } else {
                sb.append(",").append(prefix).append("_").append(massageStringValue(concept.getName()));
            }
        });
    }

    private String massageStringValue(String text) {
        if (StringUtils.isEmpty(text))
            return text;
        return text.replaceAll("\n", " ").replaceAll("\t", " ").replaceAll(",", " ");
    }

    private List<Object> getObs(ObservationCollection observations, LinkedHashMap<String, FormElement> obsMap) {
        List<Object> values = new ArrayList<>(obsMap.size());
        obsMap.forEach((conceptUUID, formElement) -> {
            Object val = observations.getOrDefault(conceptUUID, null);
            if (formElement.getConcept().getDataType().equals(ConceptDataType.Coded.toString())) {
                List<Object> codedObs = val == null ?
                        Collections.emptyList() :
                        val instanceof List ? (List<Object>) val : Collections.singletonList(val);
                values.addAll(getAns(formElement.getConcept(), codedObs));
            } else {
                values.add(val);
            }
        });
        return values;
    }

    private List<String> getAns(Concept concept, List<Object> val) {
        return concept.getSortedAnswers()
                .map(ca -> val.contains(ca.getAnswerConcept().getUuid()) ? selectedAnswerFieldValue : unSelectedAnswerFieldValue)
                .collect(Collectors.toList());
    }

}
