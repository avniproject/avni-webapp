package org.avni.exporter.v2;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.avni.application.FormElement;
import org.avni.application.FormElementType;
import org.avni.application.FormType;
import org.avni.dao.*;
import org.avni.domain.*;
import org.avni.service.AddressLevelService;
import org.avni.service.FormMappingService;
import org.avni.util.ObjectMapperSingleton;
import org.avni.web.request.export.ExportEntityType;
import org.avni.web.request.export.ExportFilters.DateFilter;
import org.avni.web.request.export.ExportOutput;
import org.joda.time.DateTime;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.file.FlatFileHeaderCallback;
import org.springframework.batch.item.file.transform.FieldExtractor;
import org.springframework.beans.factory.annotation.Autowired;
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
public class ExportV2CSVFieldExtractor implements FieldExtractor<ItemRow>, FlatFileHeaderCallback {

    private static final String selectedAnswerFieldValue = "1";
    private static final String unSelectedAnswerFieldValue = "0";
    private final ExportJobParametersRepository exportJobParametersRepository;
    private final ObjectMapper objectMapper;
    private final EncounterRepository encounterRepository;
    private final ProgramEncounterRepository programEncounterRepository;
    private final FormMappingService formMappingService;
    private final SubjectTypeRepository subjectTypeRepository;
    private final String exportJobParamsUUID;
    private final AddressLevelService addressLevelService;
    private final ProgramRepository programRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private StringBuilder headers = new StringBuilder();
    private List<String> addressLevelTypes = new ArrayList<>();

    private Map<String, FormElement> registrationMap = new LinkedHashMap<>();
    private Map<String, Map<String, FormElement>> enrolmentMap = new LinkedHashMap<>();
    private Map<String, Map<String, FormElement>> exitEnrolmentMap = new LinkedHashMap<>();
    private Map<String, Map<String, FormElement>> programEncounterMap = new LinkedHashMap<>();
    private Map<String, Map<String, FormElement>> programEncounterCancelMap = new LinkedHashMap<>();
    private Map<String, Map<String, FormElement>> encounterMap = new LinkedHashMap<>();
    private Map<String, Map<String, FormElement>> encounterCancelMap = new LinkedHashMap<>();
    private Map<String, Map<String, FormElement>> groupsMap = new LinkedHashMap<>();
    private Map<String, Map<String, FormElement>> groupEncounterMap = new LinkedHashMap<>();
    private Map<String, Map<String, FormElement>> groupEncounterCancelMap = new LinkedHashMap<>();
    private ExportOutput exportOutput;

    @Autowired
    public ExportV2CSVFieldExtractor(ExportJobParametersRepository exportJobParametersRepository,
                                     EncounterRepository encounterRepository,
                                     ProgramEncounterRepository programEncounterRepository,
                                     FormMappingService formMappingService,
                                     @Value("#{jobParameters['exportJobParamsUUID']}") String exportJobParamsUUID,
                                     SubjectTypeRepository subjectTypeRepository,
                                     AddressLevelService addressLevelService,
                                     ProgramRepository programRepository,
                                     EncounterTypeRepository encounterTypeRepository) {
        this.exportJobParametersRepository = exportJobParametersRepository;
        this.encounterRepository = encounterRepository;
        this.programEncounterRepository = programEncounterRepository;
        this.formMappingService = formMappingService;
        this.exportJobParamsUUID = exportJobParamsUUID;
        this.subjectTypeRepository = subjectTypeRepository;
        this.addressLevelService = addressLevelService;
        this.programRepository = programRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.objectMapper = ObjectMapperSingleton.getObjectMapper();
    }

    @PostConstruct
    public void init() {
        this.addressLevelTypes = addressLevelService.getAllAddressLevelTypeNames();
        ExportJobParameters exportJobParameters = exportJobParametersRepository.findByUuid(exportJobParamsUUID);
        this.exportOutput = objectMapper.convertValue(exportJobParameters.getReportFormat(), new TypeReference<ExportOutput>() {
        });
        String timezone = exportJobParameters.getTimezone();
        addMaxVisitCount(exportJobParameters);
        String subjectTypeUUID = this.exportOutput.getIndividual().getUuid();
        this.registrationMap = getApplicableFields(formMappingService.getFormMapping(subjectTypeUUID, null, null, FormType.IndividualProfile), exportOutput.getIndividual());
        addRegistrationHeaders(headers, subjectTypeRepository.findByUuid(subjectTypeUUID), this.registrationMap);

        this.exportOutput.getPrograms().forEach(p -> {
            LinkedHashMap<String, FormElement> applicableEnrolmentFields = getApplicableFields(formMappingService.getFormMapping(subjectTypeUUID, p.getUuid(), null, FormType.ProgramEnrolment), p);
            LinkedHashMap<String, FormElement> applicableExitFields = getApplicableFields(formMappingService.getFormMapping(subjectTypeUUID, p.getUuid(), null, FormType.ProgramExit), p);
            this.enrolmentMap.put(p.getUuid(), applicableEnrolmentFields);
            this.exitEnrolmentMap.put(p.getUuid(), applicableExitFields);
            addEnrolmentHeaders(headers, applicableEnrolmentFields, applicableExitFields, programRepository.findByUuid(p.getUuid()).getName());
            p.getEncounters().forEach(pe -> {
                LinkedHashMap<String, FormElement> applicableProgramEncounterFields = getApplicableFields(formMappingService.getFormMapping(subjectTypeUUID, p.getUuid(), pe.getUuid(), FormType.ProgramEncounter), p);
                LinkedHashMap<String, FormElement> applicableProgramCancelFields = getApplicableFields(formMappingService.getFormMapping(subjectTypeUUID, p.getUuid(), pe.getUuid(), FormType.ProgramEncounterCancellation), p);
                this.programEncounterMap.put(pe.getUuid(), applicableProgramEncounterFields);
                this.programEncounterCancelMap.put(pe.getUuid(), applicableProgramCancelFields);
                DateFilter dateFilter = pe.getFilters().getDate();
                Long maxProgramEncounterCount = programEncounterRepository.getMaxProgramEncounterCount(pe.getUuid(), getCalendarTime(dateFilter.getFrom(), timezone), getCalendarTime(dateFilter.getTo(), timezone));
                EncounterType encounterType = encounterTypeRepository.findByUuid(pe.getUuid());
                addEncounterHeaders(maxProgramEncounterCount, headers, applicableProgramEncounterFields, applicableProgramCancelFields, encounterType.getName());
            });
        });
        this.exportOutput.getEncounters().forEach(e -> populateGeneralEncounterMap(subjectTypeUUID, e, e.getUuid(), this.encounterMap, this.encounterCancelMap, timezone));
        this.exportOutput.getGroups().forEach(g -> {
            String groupSubjectTypeUUID = g.getUuid();
            LinkedHashMap<String, FormElement> applicableGroupsFields = getApplicableFields(formMappingService.getFormMapping(groupSubjectTypeUUID, null, null, FormType.IndividualProfile), g);
            this.groupsMap.put(g.getUuid(), applicableGroupsFields);
            addRegistrationHeaders(headers, subjectTypeRepository.findByUuid(groupSubjectTypeUUID), applicableGroupsFields);
            g.getEncounters().forEach(ge -> populateGeneralEncounterMap(groupSubjectTypeUUID, ge, ge.getUuid(), this.groupEncounterMap, this.groupEncounterCancelMap, timezone));
        });
    }

    private void populateGeneralEncounterMap(String subjectTypeUUID, ExportEntityType e, String uuid, Map<String, Map<String, FormElement>> encounterMap, Map<String, Map<String, FormElement>> encounterCancelMap, String timezone) {
        LinkedHashMap<String, FormElement> applicableEncounterFields = getApplicableFields(formMappingService.getFormMapping(subjectTypeUUID, null, uuid, FormType.Encounter), e);
        LinkedHashMap<String, FormElement> applicableCancelEncounterFields = getApplicableFields(formMappingService.getFormMapping(subjectTypeUUID, null, uuid, FormType.IndividualEncounterCancellation), e);
        encounterMap.put(e.getUuid(), applicableEncounterFields);
        encounterCancelMap.put(e.getUuid(), applicableCancelEncounterFields);
        DateFilter dateFilter = e.getFilters().getDate();
        Long maxProgramEncounterCount = encounterRepository.getMaxEncounterCount(e.getUuid(), getCalendarTime(dateFilter.getFrom(), timezone), getCalendarTime(dateFilter.getTo(), timezone));
        EncounterType encounterType = encounterTypeRepository.findByUuid(e.getUuid());
        addEncounterHeaders(maxProgramEncounterCount, headers, applicableEncounterFields, applicableCancelEncounterFields, encounterType.getName());
    }

    private LinkedHashMap<String, FormElement> getApplicableFields(Map<String, FormElement> formElementMap, ExportEntityType exportEntityType) {
        return formElementMap.entrySet()
                .stream()
                .filter(es -> exportEntityType.isEmptyOrContains(es.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (x, y) -> y, LinkedHashMap::new));
    }

    private void addRegistrationHeaders(StringBuilder headers, SubjectType subjectType, Map<String, FormElement> registrationMap) {
        String subjectTypeName = subjectType.getName();
        headers.append(subjectTypeName).append(".id");
        headers.append(",").append(subjectTypeName).append(".uuid");
        headers.append(",").append(subjectTypeName).append(".first_name");
        if (subjectType.isAllowMiddleName())
            headers.append(",").append(subjectTypeName).append(".middle_name");
        headers.append(",").append(subjectTypeName).append(".last_name");
        headers.append(",").append(subjectTypeName).append(".date_of_birth");
        headers.append(",").append(subjectTypeName).append(".registration_date");
        headers.append(",").append(subjectTypeName).append(".gender");
        addAddressLevelColumns(headers);
        if (subjectType.isGroup()) {
            headers.append(",").append(subjectTypeName).append(".total_members");
        }
        appendObsColumns(headers, subjectTypeName, registrationMap);
        addAuditColumns(headers, subjectTypeName);
    }

    private void addEnrolmentHeaders(StringBuilder headers, Map<String, FormElement> enrolmentMap, Map<String, FormElement> exitEnrolmentMap, String programName) {
        headers.append(",").append(programName).append(".id");
        headers.append(",").append(programName).append(".uuid");
        headers.append(",").append(programName).append(".enrolment_date_time");
        appendObsColumns(headers, programName, enrolmentMap);
        headers.append(",").append(programName).append(".program_exit_date_time");
        appendObsColumns(headers, programName + "_exit", exitEnrolmentMap);
        addAuditColumns(headers, programName);
    }

    private void addEncounterHeaders(Long maxVisitCount, StringBuilder headers, Map<String, FormElement> encounterMap, Map<String, FormElement> encounterCancelMap, String encounterTypeName) {
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
            appendObsColumns(headers, prefix, encounterMap);
            headers.append(",").append(prefix).append(".cancel_date_time");
            appendObsColumns(headers, prefix, encounterCancelMap);
            addAuditColumns(headers, prefix);
        }
    }


    private void addAddressLevelColumns(StringBuilder sb) {
        this.addressLevelTypes.forEach(level -> sb.append(",").append(quotedStringValue(level)));
    }

    private String quotedStringValue(String text) {
        if (StringUtils.isEmpty(text))
            return text;
        return "\"".concat(text).concat("\"");
    }

    private void addAuditColumns(StringBuilder headers, String prefix) {
        headers.append(",").append(format("%s_created_by", prefix));
        headers.append(",").append(format("%s_created_date_time", prefix));
        headers.append(",").append(format("%s_modified_by", prefix));
        headers.append(",").append(format("%s_modified_date_time", prefix));
    }

    private void appendObsColumns(StringBuilder sb, String prefix, Map<String, FormElement> map) {
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

    @Override
    public void writeHeader(Writer writer) throws IOException {
        writer.write(this.headers.toString());
    }

    private void addMaxVisitCount(ExportJobParameters exportJobParameters) {
        this.exportOutput.getEncounters().forEach(exportEntityType -> addMaxVisitCount(exportJobParameters, exportEntityType));
        this.exportOutput.getGroups().forEach(exportEntityType -> {
            exportEntityType.getEncounters().forEach(groupExportEntityType ->
                    addMaxVisitCount(exportJobParameters, groupExportEntityType));
        });
        this.exportOutput.getPrograms().forEach(programEntityType -> {
            programEntityType.getEncounters().forEach(programEncounterEntityType -> {
                addMaxProgramVisitCount(exportJobParameters, programEncounterEntityType);
            });
        });
    }

    private void addMaxProgramVisitCount(ExportJobParameters exportJobParameters, ExportEntityType programEncounterEntityType) {
        DateFilter dateFilter = programEncounterEntityType.getFilters().getDate();
        programEncounterEntityType.setMaxCount(
                programEncounterRepository.getMaxProgramEncounterCount(
                        programEncounterEntityType.getUuid(),
                        getCalendarTime(dateFilter.getFrom(), exportJobParameters.getTimezone()),
                        getCalendarTime(dateFilter.getTo(), exportJobParameters.getTimezone())
                ));
    }

    private void addMaxVisitCount(ExportJobParameters exportJobParameters, ExportEntityType exportEntityType) {
        DateFilter dateFilter = exportEntityType.getFilters().getDate();
        exportEntityType.setMaxCount(
                encounterRepository.getMaxEncounterCount(
                        exportEntityType.getUuid(),
                        getCalendarTime(dateFilter.getFrom(), exportJobParameters.getTimezone()),
                        getCalendarTime(dateFilter.getTo(), exportJobParameters.getTimezone())
                ));
    }

    private Calendar getCalendarTime(DateTime dateTime, String timeZone) {
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone(timeZone));
        calendar.setTime(dateTime.toDate());
        return calendar;
    }

    @Override
    public Object[] extract(ItemRow individual) {

        return new Object[0];
    }
}
