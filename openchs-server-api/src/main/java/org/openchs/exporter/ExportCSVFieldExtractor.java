package org.openchs.exporter;

import org.openchs.application.FormElement;
import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptDataType;
import org.openchs.domain.ObservationCollection;
import org.openchs.domain.ProgramEnrolment;
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
public class ExportCSVFieldExtractor implements FieldExtractor<ProgramEnrolment>, FlatFileHeaderCallback {

    @Value("#{jobParameters['encounterTypeUUID']}")
    private String encounterTypeUUID;

    @Value("#{jobParameters['subjectTypeUUID']}")
    private String subjectTypeUUID;

    @Value("#{jobParameters['programUUID']}")
    private String programUUID;

    private FormMappingRepository formMappingRepository;
    private LinkedHashMap<String, FormElement> registrationMap;
    private LinkedHashMap<String, FormElement> enrolmentMap;
    private LinkedHashMap<String, FormElement> programEncounterMap;

    public ExportCSVFieldExtractor(FormMappingRepository formMappingRepository) {
        this.formMappingRepository = formMappingRepository;
    }

    @PostConstruct
    public void init() {
        FormMapping programEncounterFormMapping = formMappingRepository.findByEncounterType_UuidAndProgram_UuidAndIsVoidedFalseAndSubjectType_UuidAndForm_FormType(encounterTypeUUID, programUUID, subjectTypeUUID, FormType.ProgramEncounter);
        FormMapping registrationFormMapping = formMappingRepository.findBySubjectType_UuidAndForm_FormType(subjectTypeUUID, FormType.IndividualProfile);
        FormMapping programEnrolmentFormMapping = formMappingRepository.findByProgram_UuidAndSubjectType_UuidAndForm_FormType(programUUID, subjectTypeUUID, FormType.ProgramEnrolment);
        this.registrationMap = getEntityConceptMap(registrationFormMapping);
        this.enrolmentMap = getEntityConceptMap(programEnrolmentFormMapping);
        this.programEncounterMap = getEntityConceptMap(programEncounterFormMapping);
    }

    private LinkedHashMap<String, FormElement> getEntityConceptMap(FormMapping formMapping) {
        List<FormElement> formElements = formMapping == null ? Collections.emptyList() : formMapping.getForm().getApplicableFormElements();
        return formElements.stream().collect(Collectors.toMap(f -> f.getConcept().getUuid(), f -> f, (a, b) -> b, LinkedHashMap::new));
    }

    @Override
    public Object[] extract(ProgramEnrolment programEnrolment) {
        List<Object> row = new ArrayList<>();
        row.add(programEnrolment.getIndividual().getId());
        row.add(programEnrolment.getIndividual().getUuid());
        row.add(programEnrolment.getIndividual().getFirstName());
        row.add(programEnrolment.getIndividual().getLastName());
        row.add(programEnrolment.getIndividual().getDateOfBirth());
        row.add(programEnrolment.getIndividual().getGender().getName());

        row.addAll(getObs(programEnrolment.getIndividual().getObservations(), registrationMap));

        return row.toArray();
    }


    private String massageStringValue(String text) {
        if (StringUtils.isEmpty(text))
            return text;
        return text.replaceAll("\n", " ").replaceAll("\t", " ").replaceAll(",", " ");
    }

    @Override
    public void writeHeader(Writer writer) throws IOException {
        writer.write(getHeader());
    }

    private String getHeader() {
        StringBuilder sb = new StringBuilder();

        sb.append("ind.id");
        sb.append(",").append("ind.uuid");
        sb.append(",").append("ind.first_name");
        sb.append(",").append("ind.last_name");
        sb.append(",").append("ind.date_of_birth");
        sb.append(",").append("ind.gender");
        //sb.append(",").append("ind.address");
        appendObsColumns(sb, "ind", registrationMap);
        sb.append(",").append("enl.id");
        return sb.toString();
    }

    private StringBuilder appendObsColumns(StringBuilder sb, String prefix, LinkedHashMap<String, FormElement> map) {
        map.forEach((uuid, fe) -> {
            Concept concept = fe.getConcept();
            if (concept.getDataType().equals(ConceptDataType.Coded.toString())) {
                concept.getConceptAnswers().stream().map(ca -> ca.getAnswerConcept().getName()).forEach(can ->
                        sb.append(",")
                                .append(prefix)
                                .append("_")
                                .append(concept.getName())
                                .append("_").append(can));
            } else {
                sb.append(",").append(prefix).append("_").append(concept.getName());
            }
        });
        return sb;
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

    private List<String> getAns(Concept conceptAnswers, List<Object> val) {
        return conceptAnswers.getSortedAnswers()
                .map(ca -> val.contains(ca.getAnswerConcept().getUuid()) ? "yes" : "no")
                .collect(Collectors.toList());
    }

}
