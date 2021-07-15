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

import static java.lang.String.format;

@Component
@StepScope
public class ExportCSVFieldExtractor implements FieldExtractor<ExportItemRow>, FlatFileHeaderCallback {

    private static final String selectedAnswerFieldValue = "1";
    private static final String unSelectedAnswerFieldValue = "0";
    private StringBuilder headers = new StringBuilder();
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
        switch (ReportType.valueOf(reportType)) {
            case Registration: {
                addRegistrationHeaders(this.headers);
                break;
            }
            case GroupSubject: {
                addGroupSubjectHeaders(this.headers);
                break;
            }
            case Enrolment: {
                setEnrolmentMappings();
                addRegistrationHeaders(this.headers);
                addEnrolmentHeaders(this.headers);
                break;
            }
            case Encounter: {
                if (programUUID == null) {
                    this.encounterMap = formMappingService.getFormMapping(subjectTypeUUID, null, encounterTypeUUID, FormType.Encounter);
                    this.encounterCancelMap = formMappingService.getFormMapping(subjectTypeUUID, null, encounterTypeUUID, FormType.IndividualEncounterCancellation);
                    addRegistrationHeaders(this.headers);
                } else {
                    setEnrolmentMappings();
                    this.programEncounterMap = formMappingService.getFormMapping(subjectTypeUUID, programUUID, encounterTypeUUID, FormType.ProgramEncounter);
                    this.programEncounterCancelMap = formMappingService.getFormMapping(subjectTypeUUID, programUUID, encounterTypeUUID, FormType.ProgramEncounterCancellation);
                    addRegistrationHeaders(this.headers);
                    addEnrolmentHeaders(this.headers);
                }
                this.encounterTypeName = encounterTypeRepository.getEncounterTypeName(encounterTypeUUID);
                Long maxVisitCount = getMaxVisitCount();
                Long maxVisits = maxVisitCount == null ? 0 : maxVisitCount;
                addEncounterHeaders(maxVisits, this.headers);
                break;
            }
        }
    }

    private void addGroupSubjectHeaders(StringBuilder headers) {
        headers.append("group.id");
        headers.append(",").append("group.uuid");
        headers.append(",").append("group.first_name");
        headers.append(",").append("member.id");
        headers.append(",").append("member.uuid");
        headers.append(",").append("member.first_name");
        headers.append(",").append("member.last_name");
        headers.append(",").append("member.role");
        headers.append(",").append("member.membership_start_date");
        headers.append(",").append("member.membership_end_date");
        addAuditColumns(headers, "member");
    }

    private void addEncounterHeaders(Long maxVisitCount, StringBuilder headers) {
        int visit = 0;
        while (visit < maxVisitCount) {
            visit++;
            String prefix = encounterTypeName + "_" + visit;
            headers.append(",").append(prefix).append(".id");
            headers.append(",").append(prefix).append(".uuid");
            headers.append(",").append(prefix).append(".name");
            headers.append(",").append(prefix).append(".earliest_visit_date_time");
            headers.append(",").append(prefix).append(".max_visit_date_time");
            headers.append(",").append(prefix).append(".encounter_date_time");
            appendObsColumns(headers, prefix, programUUID != null ? programEncounterMap : encounterMap);
            headers.append(",").append(prefix).append(".cancel_date_time");
            appendObsColumns(headers, prefix, programUUID != null ? programEncounterCancelMap : encounterCancelMap);
            addAuditColumns(headers, prefix);
        }
    }

    private void addEnrolmentHeaders(StringBuilder headers) {
        headers.append(",").append("enl.id");
        headers.append(",").append("enl.uuid");
        headers.append(",").append("enl.enrolment_date_time");
        appendObsColumns(headers, "enl", enrolmentMap);
        headers.append(",").append("enl.program_exit_date_time");
        appendObsColumns(headers, "enl_exit", exitEnrolmentMap);
        addAuditColumns(headers, "enl");
    }

    private void addRegistrationHeaders(StringBuilder headers) {
        headers.append("ind.id");
        headers.append(",").append("ind.uuid");
        headers.append(",").append("ind.first_name");
        headers.append(",").append("ind.last_name");
        headers.append(",").append("ind.date_of_birth");
        headers.append(",").append("ind.registration_date");
        headers.append(",").append("ind.gender");
        addAddressLevelColumns(headers);
        appendObsColumns(headers, "ind", registrationMap);
        addAuditColumns(headers, "ind");
    }

    private void addAuditColumns(StringBuilder headers, String prefix) {
        headers.append(",").append(format("%s_created_by", prefix));
        headers.append(",").append(format("%s_created_date_time", prefix));
        headers.append(",").append(format("%s_modified_by", prefix));
        headers.append(",").append(format("%s_modified_date_time", prefix));
    }

    private void setEnrolmentMappings() {
        this.enrolmentMap = formMappingService.getFormMapping(subjectTypeUUID, programUUID, null, FormType.ProgramEnrolment);
        this.exitEnrolmentMap = formMappingService.getFormMapping(subjectTypeUUID, programUUID, null, FormType.ProgramExit);
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
        if (reportType.equals(ReportType.GroupSubject.toString())) {
            addGroupSubjectFields(exportItemRow, row);
        } else {
            Individual individual = exportItemRow.getIndividual();
            AddressLevel addressLevel = individual.getAddressLevel();
            //Registration
            Gender gender = individual.getGender();
            row.add(individual.getId());
            row.add(individual.getUuid());
            row.add(massageStringValue(individual.getFirstName()));
            row.add(massageStringValue(individual.getLastName()));
            row.add(individual.getDateOfBirth());
            row.add(individual.getRegistrationDate());
            row.add(gender == null ? "" : gender.getName());
            addAddressLevels(row, addressLevel);
            row.addAll(getObs(individual.getObservations(), registrationMap));
            addAuditFields(individual.getAudit(), row);
            if (programUUID == null && reportType.equals(ReportType.Encounter.toString())) {
                addGeneralEncounterRelatedFields(exportItemRow, row);
            } else if (reportType.equals(ReportType.Enrolment.toString())) {
                addProgramEnrolmentFields(exportItemRow, row);
            } else if (programUUID != null && reportType.equals(ReportType.Encounter.toString())) {
                addProgramEnrolmentFields(exportItemRow, row);
                addProgramEncounterRelatedFields(exportItemRow, row);
            }
        }
        return row.toArray();
    }

    private void addGroupSubjectFields(ExportItemRow exportItemRow, List<Object> row) {
        GroupSubject group = exportItemRow.getGroupSubject();
        Individual groupSubject = group.getGroupSubject();
        Individual memberSubject = group.getMemberSubject();
        row.add(groupSubject.getId());
        row.add(groupSubject.getUuid());
        row.add(groupSubject.getFirstName());
        row.add(memberSubject.getId());
        row.add(memberSubject.getUuid());
        row.add(memberSubject.getFirstName());
        row.add(memberSubject.getLastName());
        row.add(group.getGroupRole().getRole());
        row.add(group.getMembershipStartDate());
        row.add(group.getMembershipEndDate());
        addAuditFields(group.getAudit(), row);
    }

    private void addAuditFields(Audit audit, List<Object> row) {
        row.add(audit.getCreatedBy().getUsername());
        row.add(audit.getCreatedDateTime());
        row.add(audit.getLastModifiedBy().getUsername());
        row.add(audit.getLastModifiedDateTime());
    }

    private void addProgramEnrolmentFields(ExportItemRow exportItemRow, List<Object> row) {
        ProgramEnrolment programEnrolment = exportItemRow.getProgramEnrolment();
        //ProgramEnrolment
        row.add(programEnrolment.getId());
        row.add(programEnrolment.getUuid());
        row.add(programEnrolment.getEnrolmentDateTime());
        row.addAll(getObs(programEnrolment.getObservations(), enrolmentMap));
        //Program Exit
        row.add(programEnrolment.getProgramExitDateTime());
        row.addAll(getObs(programEnrolment.getProgramExitObservations(), exitEnrolmentMap));
        addAuditFields(programEnrolment.getAudit(), row);
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
        row.add(massageStringValue(encounter.getName()));
        row.add(encounter.getEarliestVisitDateTime());
        row.add(encounter.getMaxVisitDateTime());
        row.add(encounter.getEncounterDateTime());
        row.addAll(getObs(encounter.getObservations(), map));
        row.add(encounter.getCancelDateTime());
        row.addAll(getObs(encounter.getCancelObservations(), cancelMap));
        addAuditFields(encounter.getAudit(), row);
    }

    @Override
    public void writeHeader(Writer writer) throws IOException {
        writer.write(this.headers.toString());
    }

    private void appendObsColumns(StringBuilder sb, String prefix, LinkedHashMap<String, FormElement> map) {
        map.forEach((uuid, fe) -> {
            Concept concept = fe.getConcept();
            if (concept.getDataType().equals(ConceptDataType.Coded.toString()) && fe.getType().equals(FormElementType.MultiSelect.toString())) {
                concept.getSortedAnswers().map(ca -> ca.getAnswerConcept().getName()).forEach(can ->
                        sb.append(",\"")
                                .append(prefix)
                                .append("_")
                                .append(concept.getName())
                                .append("_").append(can).append("\""));
            } else {
                sb.append(",\"").append(prefix).append("_").append(concept.getName()).append("\"");
            }
        });
    }

    private String massageStringValue(String text) {
        if (StringUtils.isEmpty(text))
            return text;
        return "\"".concat(text).concat("\"");
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
        Map<String, String> addressLevelMap = addressLevel != null ?
                getAddressTypeAddressLevelMap(addressLevel, addressLevel.getParentLocationMapping()) : new HashMap<>();
        this.addressLevelTypes.forEach(level -> row.add(massageStringValue(addressLevelMap.getOrDefault(level, ""))));
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
