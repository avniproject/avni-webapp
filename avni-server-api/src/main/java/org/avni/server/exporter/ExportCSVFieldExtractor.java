package org.avni.server.exporter;

import org.avni.server.application.FormElement;
import org.avni.server.application.FormElementType;
import org.avni.server.application.FormType;
import org.avni.server.dao.EncounterRepository;
import org.avni.server.dao.EncounterTypeRepository;
import org.avni.server.dao.ProgramEncounterRepository;
import org.avni.server.dao.SubjectTypeRepository;
import org.avni.server.domain.*;
import org.avni.server.service.AddressLevelService;
import org.avni.server.service.FormMappingService;
import org.avni.server.web.external.request.export.ReportType;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
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
    @Value("#{jobParameters['timeZone']}")
    private String timeZone;
    @Value("#{jobParameters['includeVoided']}")
    private String includeVoided;

    private SubjectTypeRepository subjectTypeRepository;
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

    public ExportCSVFieldExtractor(SubjectTypeRepository subjectTypeRepository,
                                   EncounterTypeRepository encounterTypeRepository,
                                   EncounterRepository encounterRepository,
                                   ProgramEncounterRepository programEncounterRepository,
                                   FormMappingService formMappingService,
                                   AddressLevelService addressLevelService) {
        this.subjectTypeRepository = subjectTypeRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.encounterRepository = encounterRepository;
        this.programEncounterRepository = programEncounterRepository;
        this.formMappingService = formMappingService;
        this.addressLevelService = addressLevelService;
    }

    @PostConstruct
    public void init() {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        this.registrationMap = formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, null, null, FormType.IndividualProfile);
        this.addressLevelTypes = addressLevelService.getAllAddressLevelTypeNames();
        switch (ReportType.valueOf(reportType)) {
            case Registration: {
                addRegistrationHeaders(this.headers, subjectType);
                break;
            }
            case GroupSubject: {
                addGroupSubjectHeaders(this.headers);
                break;
            }
            case Enrolment: {
                setEnrolmentMappings();
                addRegistrationHeaders(this.headers, subjectType);
                addEnrolmentHeaders(this.headers);
                break;
            }
            case Encounter: {
                if (programUUID == null) {
                    this.encounterMap = formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, null, encounterTypeUUID, FormType.Encounter);
                    this.encounterCancelMap = formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, null, encounterTypeUUID, FormType.IndividualEncounterCancellation);
                    addRegistrationHeaders(this.headers, subjectType);
                } else {
                    setEnrolmentMappings();
                    this.programEncounterMap = formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, programUUID, encounterTypeUUID, FormType.ProgramEncounter);
                    this.programEncounterCancelMap = formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, programUUID, encounterTypeUUID, FormType.ProgramEncounterCancellation);
                    addRegistrationHeaders(this.headers, subjectType);
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
        addVoidedColumnIfRequired(headers, "group");
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
            addVoidedColumnIfRequired(headers, prefix);
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
        addVoidedColumnIfRequired(headers, "enl");
    }

    private void addRegistrationHeaders(StringBuilder headers, SubjectType subjectType) {
        headers.append("ind.id");
        headers.append(",").append("ind.uuid");
        headers.append(",").append("ind.first_name");
        if (subjectType.isAllowMiddleName())
            headers.append(",").append("ind.middle_name");
        headers.append(",").append("ind.last_name");
        headers.append(",").append("ind.date_of_birth");
        headers.append(",").append("ind.registration_date");
        headers.append(",").append("ind.gender");
        addAddressLevelColumns(headers);
        if(subjectType.isGroup()) {
            headers.append(",").append("ind.total_members");
        }
        appendObsColumns(headers, "ind", registrationMap);
        addAuditColumns(headers, "ind");
        addVoidedColumnIfRequired(headers, "ind");
    }

    private void addVoidedColumnIfRequired(StringBuilder headers, String prefix) {
        if (Boolean.parseBoolean(includeVoided)) {
            headers.append(",").append(format("%s.voided", prefix));
        }
    }


    private void addAuditColumns(StringBuilder headers, String prefix) {
        headers.append(",").append(format("%s_created_by", prefix));
        headers.append(",").append(format("%s_created_date_time", prefix));
        headers.append(",").append(format("%s_modified_by", prefix));
        headers.append(",").append(format("%s_modified_date_time", prefix));
    }

    private void setEnrolmentMappings() {
        this.enrolmentMap = formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, programUUID, null, FormType.ProgramEnrolment);
        this.exitEnrolmentMap = formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, programUUID, null, FormType.ProgramExit);
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
            SubjectType subjectType = individual.getSubjectType();
            //Registration
            Gender gender = individual.getGender();
            row.add(individual.getId());
            row.add(individual.getUuid());
            row.add(QuotedStringValue(individual.getFirstName()));
            if (individual.getSubjectType().isAllowMiddleName())
                row.add(QuotedStringValue(individual.getMiddleName()));
            row.add(QuotedStringValue(individual.getLastName()));
            row.add(individual.getDateOfBirth());
            row.add(individual.getRegistrationDate());
            row.add(gender == null ? "" : gender.getName());
            addAddressLevels(row, addressLevel);
            if (subjectType.isGroup()) {
                row.add(getTotalMembers(individual));
            }
            row.addAll(getObs(individual.getObservations(), registrationMap));
            addAuditFields(individual, row);
            addVoidedFieldIfRequired(individual, row);
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

    private long getTotalMembers(Individual individual) {
        return individual.getGroupSubjects()
                .stream()
                .filter(gs -> gs.getMembershipEndDate() == null && !gs.getMemberSubject().isVoided())
                .count();
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
        if (memberSubject.getSubjectType().isAllowMiddleName())
            row.add(memberSubject.getMiddleName());
        row.add(memberSubject.getLastName());
        row.add(group.getGroupRole().getRole());
        row.add(getDateForTimeZone(group.getMembershipStartDate()));
        row.add(getDateForTimeZone(group.getMembershipEndDate()));
        addAuditFields(group, row);
        addVoidedFieldIfRequired(group, row);
    }

    private void addVoidedFieldIfRequired(CHSEntity chsEntity, List<Object> row) {
        if (Boolean.parseBoolean(includeVoided)) {
            row.add(chsEntity.isVoided());
        }
    }

    private void addAuditFields(Auditable auditable, List<Object> row) {
        row.add(auditable.getCreatedBy().getUsername());
        row.add(getDateForTimeZone(auditable.getCreatedDateTime()));
        row.add(auditable.getLastModifiedBy().getUsername());
        row.add(getDateForTimeZone(auditable.getLastModifiedDateTime()));
    }

    private void addProgramEnrolmentFields(ExportItemRow exportItemRow, List<Object> row) {
        ProgramEnrolment programEnrolment = exportItemRow.getProgramEnrolment();
        //ProgramEnrolment
        row.add(programEnrolment.getId());
        row.add(programEnrolment.getUuid());
        row.add(getDateForTimeZone(programEnrolment.getEnrolmentDateTime()));
        row.addAll(getObs(programEnrolment.getObservations(), enrolmentMap));
        //Program Exit
        row.add(getDateForTimeZone(programEnrolment.getProgramExitDateTime()));
        row.addAll(getObs(programEnrolment.getProgramExitObservations(), exitEnrolmentMap));
        addAuditFields(programEnrolment, row);
        addVoidedFieldIfRequired(programEnrolment, row);
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
        row.add(QuotedStringValue(encounter.getName()));
        row.add(getDateForTimeZone(encounter.getEarliestVisitDateTime()));
        row.add(getDateForTimeZone(encounter.getMaxVisitDateTime()));
        row.add(getDateForTimeZone(encounter.getEncounterDateTime()));
        row.addAll(getObs(encounter.getObservations(), map));
        row.add(getDateForTimeZone(encounter.getCancelDateTime()));
        row.addAll(getObs(encounter.getCancelObservations(), cancelMap));
        addAuditFields(encounter, row);
        addVoidedFieldIfRequired(encounter, row);
    }

    @Override
    public void writeHeader(Writer writer) throws IOException {
        writer.write(this.headers.toString());
    }

    private void appendObsColumns(StringBuilder sb, String prefix, LinkedHashMap<String, FormElement> map) {
        map.forEach((uuid, fe) -> {
            if (ConceptDataType.isGroupQuestion(fe.getConcept().getDataType())) return;
            Concept concept = fe.getConcept();
            String groupPrefix = fe.getGroup() != null ? fe.getGroup().getConcept().getName() + "_" : "";
            if (concept.getDataType().equals(ConceptDataType.Coded.toString()) && fe.getType().equals(FormElementType.MultiSelect.toString())) {
                concept.getSortedAnswers().map(ca -> ca.getAnswerConcept().getName()).forEach(can ->
                        sb.append(",\"")
                                .append(prefix)
                                .append("_")
                                .append(groupPrefix)
                                .append(concept.getName())
                                .append("_").append(can).append("\""));
            } else {
                sb.append(",\"").append(prefix).append("_").append(groupPrefix).append(concept.getName()).append("\"");
            }
        });
    }

    private String QuotedStringValue(String text) {
        if (StringUtils.isEmpty(text))
            return text;
        return "\"".concat(text).concat("\"");
    }

    private List<Object> getObs(ObservationCollection observations, LinkedHashMap<String, FormElement> obsMap) {
        List<Object> values = new ArrayList<>(obsMap.size());
        obsMap.forEach((conceptUUID, formElement) -> {
            if (ConceptDataType.isGroupQuestion(formElement.getConcept().getDataType())) return;
            Object val;
            if (formElement.getGroup() != null) {
                Concept parentConcept = formElement.getGroup().getConcept();
                Map<String, Object> nestedObservations = observations == null ? Collections.EMPTY_MAP : (Map<String, Object>) observations.getOrDefault(parentConcept.getUuid(), new HashMap<String, Object>());
                val = nestedObservations.getOrDefault(conceptUUID, null);
            } else {
                val = observations == null ? null : observations.getOrDefault(conceptUUID, null);
            }
            String dataType = formElement.getConcept().getDataType();
            if (dataType.equals(ConceptDataType.Coded.toString())) {
                values.addAll(processCodedObs(formElement.getType(), val, formElement));
            } else if(dataType.equals(ConceptDataType.DateTime.toString()) || dataType.equals(ConceptDataType.Date.toString())){
                values.add(processDateObs(val));
            } else if (ConceptDataType.isMedia(dataType)) {
                values.add(processMediaObs(val));
            } else {
                values.add(QuotedStringValue(String.valueOf(Optional.ofNullable(val).orElse(""))));
            }
        });
        return values;
    }

    private Object processDateObs(Object val) {
        if(val == null) return "";
        return getDateForTimeZone(new DateTime(String.valueOf(val)));
    }

    private DateTime getDateForTimeZone(DateTime dateTime) {
        return dateTime == null ? null : dateTime.withZone(DateTimeZone.forID(timeZone));
    }

    private List<Object> processCodedObs(String formType, Object val, FormElement formElement) {
        List<Object> values = new ArrayList<>();
        if (formType.equals(FormElementType.MultiSelect.toString())) {
            List<Object> codedObs = getObservationValueList(val);
            values.addAll(getAns(formElement.getConcept(), codedObs));
        } else {
            values.add(val == null ? "" : getAnsName(formElement.getConcept(), val));
        }
        return values;
    }

    private List<Object> getObservationValueList(Object val) {
        return val == null ?
                Collections.emptyList() :
                val instanceof List ? (List<Object>) val : Collections.singletonList(val);
    }

    private String processMediaObs(Object val) {
        List<String> imageURIs = getObservationValueList(val).stream().map(t -> (String) t).collect(Collectors.toList());
        return QuotedStringValue(String.join(",", imageURIs));
    }

    private String getAnsName(Concept concept, Object val) {
        return concept.getSortedAnswers()
                .filter(ca -> ca.getAnswerConcept().getUuid().equals(val))
                .map(ca -> QuotedStringValue(ca.getAnswerConcept().getName()))
                .findFirst().orElse("");
    }

    private List<String> getAns(Concept concept, List<Object> val) {
        return concept.getSortedAnswers()
                .map(ca -> val.contains(ca.getAnswerConcept().getUuid()) ? selectedAnswerFieldValue : unSelectedAnswerFieldValue)
                .collect(Collectors.toList());
    }

    private void addAddressLevelColumns(StringBuilder sb) {
        this.addressLevelTypes.forEach(level -> sb.append(",").append(QuotedStringValue(level)));
    }

    private void addAddressLevels(List<Object> row, AddressLevel addressLevel) {
        Map<String, String> addressLevelMap = addressLevel != null ?
                getAddressTypeAddressLevelMap(addressLevel, addressLevel.getParentLocationMapping()) : new HashMap<>();
        this.addressLevelTypes.forEach(level -> row.add(QuotedStringValue(addressLevelMap.getOrDefault(level, ""))));
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
