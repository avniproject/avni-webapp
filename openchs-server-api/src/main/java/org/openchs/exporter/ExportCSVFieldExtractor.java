package org.openchs.exporter;

import org.openchs.application.FormElement;
import org.openchs.application.FormElementType;
import org.openchs.application.FormType;
import org.openchs.dao.EncounterRepository;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramEncounterRepository;
import org.openchs.domain.*;
import org.openchs.service.AddressLevelService;
import org.openchs.service.FormMappingService;
import org.openchs.web.request.ReportType;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.file.FlatFileHeaderCallback;
import org.springframework.batch.item.file.transform.FieldExtractor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.Writer;
import java.util.*;
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

    @Value("#{jobParameters['reportType']}")
    private String reportType;

    @Value("#{jobParameters['startDate']}")
    private Date startDate;

    @Value("#{jobParameters['endDate']}")
    private Date endDate;

    private EncounterTypeRepository encounterTypeRepository;
    private EncounterRepository encounterRepository;
    private ProgramEncounterRepository programEncounterRepository;

    private LinkedHashMap<String, FormElement> registrationMap;
    private LinkedHashMap<String, FormElement> enrolmentMap = new LinkedHashMap<>();
    private LinkedHashMap<String, FormElement> exitEnrolmentMap = new LinkedHashMap<>();
    private LinkedHashMap<String, FormElement> programEncounterMap = new LinkedHashMap<>();
    private LinkedHashMap<String, FormElement> programEncounterCancelMap = new LinkedHashMap<>();
    private LinkedHashMap<String, FormElement> encounterMap = new LinkedHashMap<>();
    private LinkedHashMap<String, FormElement> encounterCancelMap = new LinkedHashMap<>();
    private List<String> addressLevelTypes = new ArrayList<>();
    private String encounterTypeName;
    private Long maxVisitCount = 0L;
    private FormMappingService formMappingService;
    private AddressLevelService addressLevelService;

    public ExportCSVFieldExtractor(EncounterTypeRepository encounterTypeRepository,
                                   EncounterRepository encounterRepository,
                                   ProgramEncounterRepository programEncounterRepository,
                                   FormMappingService formMappingService,
                                   AddressLevelService addressLevelService) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.encounterRepository = encounterRepository;
        this.programEncounterRepository = programEncounterRepository;
        this.formMappingService = formMappingService;
        this.addressLevelService = addressLevelService;
    }

    @PostConstruct
    public void init() {
        this.registrationMap = formMappingService.getFormMapping(subjectTypeUUID, null, null, FormType.IndividualProfile);
        this.addressLevelTypes = addressLevelService.getAllAddressLevelTypeNames();
        if (reportType.equals(ReportType.All.name())) {
            if (programUUID == null) {
                this.encounterMap = formMappingService.getFormMapping(subjectTypeUUID, null, encounterTypeUUID, FormType.Encounter);
                this.encounterCancelMap = formMappingService.getFormMapping(subjectTypeUUID, null, encounterTypeUUID, FormType.IndividualEncounterCancellation);
            } else {
                this.enrolmentMap = formMappingService.getFormMapping(subjectTypeUUID, programUUID, null, FormType.ProgramEnrolment);
                this.exitEnrolmentMap = formMappingService.getFormMapping(subjectTypeUUID, programUUID, null, FormType.ProgramExit);
                this.programEncounterMap = formMappingService.getFormMapping(subjectTypeUUID, programUUID, encounterTypeUUID, FormType.ProgramEncounter);
                this.programEncounterCancelMap = formMappingService.getFormMapping(subjectTypeUUID, programUUID, encounterTypeUUID, FormType.ProgramEncounterCancellation);
            }
            this.encounterTypeName = encounterTypeRepository.getEncounterTypeName(encounterTypeUUID);
            Long maxVisitCount = getMaxVisitCount();
            this.maxVisitCount = maxVisitCount == null ? 0 : maxVisitCount;
        }
    }

    private Long getMaxVisitCount() {
        return programUUID == null ? encounterRepository.getMaxEncounterCount(encounterTypeUUID, getCalendarTime(startDate), getCalendarTime(endDate)) :
                programEncounterRepository.getMaxProgramEncounterCount(encounterTypeUUID, getCalendarTime(startDate), getCalendarTime(endDate));
    }

    private Calendar getCalendarTime(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        return calendar;
    }

    @Override
    public Object[] extract(ExportItemRow exportItemRow) {
        List<Object> row = new ArrayList<>();
        AddressLevel addressLevel = exportItemRow.getIndividual().getAddressLevel();
        //Registration
        Gender gender = exportItemRow.getIndividual().getGender();
        row.add(exportItemRow.getIndividual().getId());
        row.add(exportItemRow.getIndividual().getUuid());
        row.add(massageStringValue(exportItemRow.getIndividual().getFirstName()));
        row.add(massageStringValue(exportItemRow.getIndividual().getLastName()));
        row.add(exportItemRow.getIndividual().getDateOfBirth());
        row.add(exportItemRow.getIndividual().getRegistrationDate());
        row.add(gender == null ? "" : gender.getName());
        addAddressLevels(row, addressLevel);
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
        exportItemRow.getEncounters().forEach(encounter -> addEncounter(row, encounter, encounterMap, encounterCancelMap));
    }

    private void addProgramEncounterRelatedFields(ExportItemRow exportItemRow, List<Object> row) {
        //ProgramEncounter
        exportItemRow.getProgramEncounters().forEach(programEncounter -> addEncounter(row, programEncounter, programEncounterMap, programEncounterCancelMap));
    }

    private <T extends AbstractEncounter> void addEncounter(List<Object> row, T encounter, LinkedHashMap<String, FormElement> map, LinkedHashMap<String, FormElement> cancelMap) {
        row.add(encounter.getId());
        row.add(encounter.getUuid());
        row.add(encounter.getName());
        row.add(encounter.getEarliestVisitDateTime());
        row.add(encounter.getMaxVisitDateTime());
        row.add(encounter.getEncounterDateTime());
        row.addAll(getObs(encounter.getObservations(), map));
        row.add(encounter.getCancelDateTime());
        row.addAll(getObs(encounter.getCancelObservations(), cancelMap));
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
        addAddressLevelColumns(sb);
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
            sb.append(",").append(encounterTypeName).append("_").append(visit).append(".name");
            sb.append(",").append(encounterTypeName).append("_").append(visit).append(".earliest_visit_date_time");
            sb.append(",").append(encounterTypeName).append("_").append(visit).append(".max_visit_date_time");
            sb.append(",").append(encounterTypeName).append("_").append(visit).append(".encounter_date_time");
            appendObsColumns(sb, encounterTypeName + "_" + visit, programUUID != null ? programEncounterMap : encounterMap);
            sb.append(",").append(encounterTypeName).append("_").append(visit).append(".cancel_date_time");
            appendObsColumns(sb, encounterTypeName + "_" + visit, programUUID != null ? programEncounterCancelMap : encounterCancelMap);
        }
        return sb.toString();
    }

    private void appendObsColumns(StringBuilder sb, String prefix, LinkedHashMap<String, FormElement> map) {
        map.forEach((uuid, fe) -> {
            Concept concept = fe.getConcept();
            if (concept.getDataType().equals(ConceptDataType.Coded.toString()) && fe.getType().equals(FormElementType.MultiSelect.toString())) {
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
            Object val = observations == null ? null : observations.getOrDefault(conceptUUID, null);
            if (formElement.getConcept().getDataType().equals(ConceptDataType.Coded.toString())) {
                values.addAll(processCodedObs(formElement.getType(), val, formElement));
            } else {
                values.add(massageStringValue(String.valueOf(Optional.ofNullable(val).orElse(""))));
            }
        });
        return values;
    }

    private List<Object> processCodedObs(String formType, Object val, FormElement formElement) {
        List<Object> values = new ArrayList<>();
        if (formType.equals(FormElementType.MultiSelect.toString())) {
            List<Object> codedObs = val == null ?
                    Collections.emptyList() :
                    val instanceof List ? (List<Object>) val : Collections.singletonList(val);
            values.addAll(getAns(formElement.getConcept(), codedObs));
        } else {
            values.add(val == null ? "" : getAnsName(formElement.getConcept(), val));
        }
        return values;
    }

    private String getAnsName(Concept concept, Object val) {
        return concept.getSortedAnswers()
                .filter(ca -> ca.getAnswerConcept().getUuid().equals(val))
                .map(ca -> massageStringValue(ca.getAnswerConcept().getName()))
                .findFirst().orElse("");
    }

    private List<String> getAns(Concept concept, List<Object> val) {
        return concept.getSortedAnswers()
                .map(ca -> val.contains(ca.getAnswerConcept().getUuid()) ? selectedAnswerFieldValue : unSelectedAnswerFieldValue)
                .collect(Collectors.toList());
    }

    private void addAddressLevelColumns(StringBuilder sb) {
        this.addressLevelTypes.forEach(level -> sb.append(",").append(massageStringValue(level)));
    }

    private void addAddressLevels(List<Object> row, AddressLevel addressLevel) {
        Map<String, String> addressLevelMap = getAddressTypeAddressLevelMap(addressLevel, addressLevel.getParentLocationMapping());
        this.addressLevelTypes.forEach(level -> row.add(addressLevelMap.getOrDefault(level, "")));
    }

    private Map<String, String> getAddressTypeAddressLevelMap(AddressLevel addressLevel, ParentLocationMapping parentLocationMapping) {
        Map<String, String> addressTypeAddressLevelMap = new HashMap<>();
        addressTypeAddressLevelMap.put(addressLevel.getType().getName(), addressLevel.getTitle());
        if (parentLocationMapping == null) {
            return addressTypeAddressLevelMap;
        }
        AddressLevel parentLocation = parentLocationMapping.getParentLocation();
        while (parentLocation != null) {
            addressTypeAddressLevelMap.put(parentLocation.getType().getName(), parentLocation.getTitle());
            parentLocation = parentLocation.getParentLocation();
        }
        return addressTypeAddressLevelMap;
    }
}
