package org.avni.exporter.v2;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.avni.application.FormElement;
import org.avni.application.FormType;
import org.avni.dao.*;
import org.avni.domain.EncounterType;
import org.avni.domain.ExportJobParameters;
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

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.Writer;
import java.util.*;
import java.util.stream.Collectors;

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
    private final HeaderCreator headerCreator;
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

    @Autowired
    public ExportV2CSVFieldExtractor(ExportJobParametersRepository exportJobParametersRepository,
                                     EncounterRepository encounterRepository,
                                     ProgramEncounterRepository programEncounterRepository,
                                     FormMappingService formMappingService,
                                     @Value("#{jobParameters['exportJobParamsUUID']}") String exportJobParamsUUID,
                                     SubjectTypeRepository subjectTypeRepository,
                                     AddressLevelService addressLevelService,
                                     ProgramRepository programRepository,
                                     EncounterTypeRepository encounterTypeRepository,
                                     HeaderCreator headerCreator) {
        this.exportJobParametersRepository = exportJobParametersRepository;
        this.encounterRepository = encounterRepository;
        this.programEncounterRepository = programEncounterRepository;
        this.formMappingService = formMappingService;
        this.exportJobParamsUUID = exportJobParamsUUID;
        this.subjectTypeRepository = subjectTypeRepository;
        this.addressLevelService = addressLevelService;
        this.programRepository = programRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.headerCreator = headerCreator;
        this.objectMapper = ObjectMapperSingleton.getObjectMapper();
    }

    @PostConstruct
    public void init() {
        this.addressLevelTypes = addressLevelService.getAllAddressLevelTypeNames();
        ExportJobParameters exportJobParameters = exportJobParametersRepository.findByUuid(exportJobParamsUUID);
        ExportOutput exportOutput = objectMapper.convertValue(exportJobParameters.getReportFormat(), new TypeReference<ExportOutput>() {});
        String timezone = exportJobParameters.getTimezone();
        String subjectTypeUUID = exportOutput.getUuid();
        this.registrationMap = getApplicableFields(formMappingService.getFormMapping(subjectTypeUUID, null, null, FormType.IndividualProfile), exportOutput);
        this.headers.append(headerCreator.addRegistrationHeaders(subjectTypeRepository.findByUuid(subjectTypeUUID), this.registrationMap, this.addressLevelTypes));

        exportOutput.getPrograms().forEach(p -> {
            LinkedHashMap<String, FormElement> applicableEnrolmentFields = getApplicableFields(formMappingService.getFormMapping(subjectTypeUUID, p.getUuid(), null, FormType.ProgramEnrolment), p);
            LinkedHashMap<String, FormElement> applicableExitFields = getApplicableFields(formMappingService.getFormMapping(subjectTypeUUID, p.getUuid(), null, FormType.ProgramExit), p);
            this.enrolmentMap.put(p.getUuid(), applicableEnrolmentFields);
            this.exitEnrolmentMap.put(p.getUuid(), applicableExitFields);
            this.headers.append(headerCreator.addEnrolmentHeaders(applicableEnrolmentFields, applicableExitFields, programRepository.findByUuid(p.getUuid()).getName()));
            p.getEncounters().forEach(pe -> {
                LinkedHashMap<String, FormElement> applicableProgramEncounterFields = getApplicableFields(formMappingService.getFormMapping(subjectTypeUUID, p.getUuid(), pe.getUuid(), FormType.ProgramEncounter), p);
                LinkedHashMap<String, FormElement> applicableProgramCancelFields = getApplicableFields(formMappingService.getFormMapping(subjectTypeUUID, p.getUuid(), pe.getUuid(), FormType.ProgramEncounterCancellation), p);
                this.programEncounterMap.put(pe.getUuid(), applicableProgramEncounterFields);
                this.programEncounterCancelMap.put(pe.getUuid(), applicableProgramCancelFields);
                DateFilter dateFilter = pe.getFilters().getDate();
                Long maxProgramEncounterCount = programEncounterRepository.getMaxProgramEncounterCount(pe.getUuid(), getCalendarTime(dateFilter.getFrom(), timezone), getCalendarTime(dateFilter.getTo(), timezone));
                EncounterType encounterType = encounterTypeRepository.findByUuid(pe.getUuid());
                this.headers.append(headerCreator.addEncounterHeaders(maxProgramEncounterCount, applicableProgramEncounterFields, applicableProgramCancelFields, encounterType.getName()));
            });
        });
        exportOutput.getEncounters().forEach(e -> populateGeneralEncounterMap(subjectTypeUUID, e, e.getUuid(), this.encounterMap, this.encounterCancelMap, timezone));
        exportOutput.getGroups().forEach(g -> {
            String groupSubjectTypeUUID = g.getUuid();
            LinkedHashMap<String, FormElement> applicableGroupsFields = getApplicableFields(formMappingService.getFormMapping(groupSubjectTypeUUID, null, null, FormType.IndividualProfile), g);
            this.groupsMap.put(g.getUuid(), applicableGroupsFields);
            this.headers.append(headerCreator.addRegistrationHeaders(subjectTypeRepository.findByUuid(groupSubjectTypeUUID), applicableGroupsFields, this.addressLevelTypes));
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
        this.headers.append(headerCreator.addEncounterHeaders(maxProgramEncounterCount, applicableEncounterFields, applicableCancelEncounterFields, encounterType.getName()));
    }

    private LinkedHashMap<String, FormElement> getApplicableFields(Map<String, FormElement> formElementMap, ExportEntityType exportEntityType) {
        return formElementMap.entrySet()
                .stream()
                .filter(es -> exportEntityType.isEmptyOrContains(es.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (x, y) -> y, LinkedHashMap::new));
    }

    @Override
    public void writeHeader(Writer writer) throws IOException {
        writer.write(this.headers.toString());
    }

    private Calendar getCalendarTime(DateTime dateTime, String timeZone) {
        if (dateTime == null) return null;
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone(timeZone));
        calendar.setTime(dateTime.toDate());
        return calendar;
    }

    @Override
    public Object[] extract(ItemRow individual) {

        return new Object[0];
    }
}
