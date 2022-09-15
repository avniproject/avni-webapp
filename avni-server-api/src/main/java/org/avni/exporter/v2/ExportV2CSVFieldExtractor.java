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
import org.joda.time.DateTimeZone;
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
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Component
@StepScope
public class ExportV2CSVFieldExtractor implements FieldExtractor<ItemRow>, FlatFileHeaderCallback {

    private static final String selectedAnswerFieldValue = "1";
    private static final String unSelectedAnswerFieldValue = "0";
    public static final String EMPTY_STRING = "";
    private final ExportJobParametersRepository exportJobParametersRepository;
    private final ObjectMapper objectMapper;
    private final EncounterRepository encounterRepository;
    private final ProgramEncounterRepository programEncounterRepository;
    private final FormMappingService formMappingService;
    private final SubjectTypeRepository subjectTypeRepository;
    private final String exportJobParamsUUID;
    private final String timeZone;
    private final AddressLevelService addressLevelService;
    private final ProgramRepository programRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final HeaderCreator headerCreator;
    private ExportOutput exportOutput;

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
                                     @Value("#{jobParameters['timeZone']}") String timeZone,
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
        this.timeZone = timeZone;
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
        String timezone = exportJobParameters.getTimezone();
        exportOutput = objectMapper.convertValue(exportJobParameters.getReportFormat(), new TypeReference<ExportOutput>() {
        });
        String subjectTypeUUID = exportOutput.getUuid();
        this.registrationMap = getApplicableFields(formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, null, null, FormType.IndividualProfile), exportOutput);
        this.headers.append(headerCreator.addRegistrationHeaders(subjectTypeRepository.findByUuid(subjectTypeUUID), this.registrationMap, this.addressLevelTypes, exportOutput.getFields()));
        exportOutput.getPrograms().forEach(p -> {
            LinkedHashMap<String, FormElement> applicableEnrolmentFields = getApplicableFields(formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, p.getUuid(), null, FormType.ProgramEnrolment), p);
            LinkedHashMap<String, FormElement> applicableExitFields = getApplicableFields(formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, p.getUuid(), null, FormType.ProgramExit), p);
            this.enrolmentMap.put(p.getUuid(), applicableEnrolmentFields);
            this.exitEnrolmentMap.put(p.getUuid(), applicableExitFields);
            this.headers.append(",")
                    .append(headerCreator.addEnrolmentHeaders(applicableEnrolmentFields, applicableExitFields, programRepository.findByUuid(p.getUuid()).getName(), p.getFields()));
            p.getEncounters().forEach(pe -> {
                LinkedHashMap<String, FormElement> applicableProgramEncounterFields = getApplicableFields(formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, p.getUuid(), pe.getUuid(), FormType.ProgramEncounter), p);
                LinkedHashMap<String, FormElement> applicableProgramCancelFields = getApplicableFields(formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, p.getUuid(), pe.getUuid(), FormType.ProgramEncounterCancellation), p);
                this.programEncounterMap.put(pe.getUuid(), applicableProgramEncounterFields);
                this.programEncounterCancelMap.put(pe.getUuid(), applicableProgramCancelFields);
                DateFilter dateFilter = pe.getFilters().getDate();
                Long maxProgramEncounterCount = programEncounterRepository.getMaxProgramEncounterCount(pe.getUuid(), getCalendarTime(dateFilter.getFrom(), timezone), getCalendarTime(dateFilter.getTo(), timezone));
                maxProgramEncounterCount = maxProgramEncounterCount == null ? 1l : maxProgramEncounterCount;
                EncounterType encounterType = encounterTypeRepository.findByUuid(pe.getUuid());
                pe.setMaxCount(maxProgramEncounterCount);
                this.headers.append(",")
                        .append(headerCreator.addEncounterHeaders(maxProgramEncounterCount, applicableProgramEncounterFields, applicableProgramCancelFields, encounterType.getName(), pe.getFields()));
            });
        });
        exportOutput.getEncounters().forEach(e -> populateGeneralEncounterMap(subjectTypeUUID, e, e.getUuid(), this.encounterMap, this.encounterCancelMap, timezone));
        exportOutput.getGroups().forEach(g -> {
            String groupSubjectTypeUUID = g.getUuid();
            LinkedHashMap<String, FormElement> applicableGroupsFields = getApplicableFields(formMappingService.getAllFormElementsAndDecisionMap(groupSubjectTypeUUID, null, null, FormType.IndividualProfile), g);
            this.groupsMap.put(g.getUuid(), applicableGroupsFields);
            this.headers.append(",")
                    .append(headerCreator.addRegistrationHeaders(subjectTypeRepository.findByUuid(groupSubjectTypeUUID), applicableGroupsFields, this.addressLevelTypes, g.getFields()));
            g.getEncounters().forEach(ge -> populateGeneralEncounterMap(groupSubjectTypeUUID, ge, ge.getUuid(), this.groupEncounterMap, this.groupEncounterCancelMap, timezone));
        });
    }

    private void populateGeneralEncounterMap(String subjectTypeUUID, ExportEntityType e, String uuid, Map<String, Map<String, FormElement>> encounterMap, Map<String, Map<String, FormElement>> encounterCancelMap, String timezone) {
        LinkedHashMap<String, FormElement> applicableEncounterFields = getApplicableFields(formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, null, uuid, FormType.Encounter), e);
        LinkedHashMap<String, FormElement> applicableCancelEncounterFields = getApplicableFields(formMappingService.getAllFormElementsAndDecisionMap(subjectTypeUUID, null, uuid, FormType.IndividualEncounterCancellation), e);
        encounterMap.put(e.getUuid(), applicableEncounterFields);
        encounterCancelMap.put(e.getUuid(), applicableCancelEncounterFields);
        DateFilter dateFilter = e.getFilters().getDate();
        Long maxEncounterCount = encounterRepository.getMaxEncounterCount(e.getUuid(), getCalendarTime(dateFilter.getFrom(), timezone), getCalendarTime(dateFilter.getTo(), timezone));
        maxEncounterCount = maxEncounterCount == null ? 1l : maxEncounterCount;
        EncounterType encounterType = encounterTypeRepository.findByUuid(e.getUuid());
        e.setMaxCount(maxEncounterCount);
        this.headers.append(",")
                .append(headerCreator.addEncounterHeaders(maxEncounterCount, applicableEncounterFields, applicableCancelEncounterFields, encounterType.getName(), e.getFields()));
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

    public ExportOutput getExportOutput() {
        return exportOutput;
    }

    public void setExportOutput(ExportOutput exportOutput) {
        this.exportOutput = exportOutput;
    }

    @Override
    public Object[] extract(ItemRow individual) {
        return createRow(individual);
    }

    private Object[] createRow(ItemRow itemRow) {
        List<Object> columnsData = new ArrayList<>();
        addRegistrationColumns(columnsData, itemRow.getIndividual(), this.registrationMap);
        Map<ProgramEnrolment, Map<String, List<ProgramEncounter>>> programEnrolmentToEncountersMap = itemRow.getProgramEnrolmentToEncountersMap();
        exportOutput.getPrograms().forEach(program -> {
            Optional<ProgramEnrolment> programEnrolmentOptional = programEnrolmentToEncountersMap.keySet().stream().filter(pe -> pe.getProgram().getUuid().equals(program.getUuid())).findFirst();
            if (programEnrolmentOptional.isPresent()) {
                programEnrolmentOptional.ifPresent(programEnrolment -> {
                    addEnrolmentColumns(columnsData, programEnrolment, this.enrolmentMap.get(program.getUuid()), this.exitEnrolmentMap.get(program.getUuid()), program);
                    program.getEncounters().forEach(pe -> {
                        Map<String, List<ProgramEncounter>> encounterTypeListMap = programEnrolmentToEncountersMap.get(programEnrolment);
                        if (encounterTypeListMap != null && encounterTypeListMap.get(pe.getUuid()) != null) {
                            addEncounterColumns(pe.getMaxCount(), columnsData, encounterTypeListMap.get(pe.getUuid()), this.programEncounterMap.get(pe.getUuid()),
                                    this.programEncounterCancelMap.get(pe.getUuid()), pe);
                        } else {
                            AddBlanks(columnsData, pe.getTotalNumberOfColumns());
                        }
                    });
                });
            } else {
                AddBlanks(columnsData, program.getTotalNumberOfColumns());
            }
        });
        exportOutput.getEncounters().forEach(enc -> {
            List<Encounter> encounterTypeList = itemRow.getEncounterTypeToEncountersMap().get(enc.getUuid());
            if (encounterTypeList != null) {
                addEncounterColumns(enc.getMaxCount(), columnsData, encounterTypeList,
                        this.encounterMap.get(enc.getUuid()), this.encounterCancelMap.get(enc.getUuid()), enc);
            } else {
                AddBlanks(columnsData, enc.getTotalNumberOfColumns());
            }
        });
        exportOutput.getGroups().forEach(grp -> {
            String groupSubjectTypeUUID = grp.getUuid();
            Map<Individual, Map<String, List<Encounter>>> groupSubjectToEncountersMap = itemRow.getGroupSubjectToEncountersMap();
            Optional<Individual> groupSubjectOptional = groupSubjectToEncountersMap.keySet().stream()
                    .filter(individual -> individual.getSubjectType().getUuid().equals(groupSubjectTypeUUID)).findFirst();
            if (groupSubjectOptional.isPresent()) {
                groupSubjectOptional.ifPresent(individual -> {
                    addRegistrationColumns(columnsData, individual, this.groupsMap.get(groupSubjectTypeUUID));
                    Map<String, List<Encounter>> encounterTypeListMap = groupSubjectToEncountersMap.get(individual);
                    grp.getEncounters().forEach(ge -> {
                        if (encounterTypeListMap != null && encounterTypeListMap.get(ge.getUuid()) != null) {
                            addEncounterColumns(ge.getMaxCount(), columnsData, encounterTypeListMap.get(ge.getUuid()),
                                    this.groupEncounterMap.get(ge.getUuid()), this.groupEncounterCancelMap.get(ge.getUuid()), ge);
                        } else {
                            AddBlanks(columnsData, ge.getTotalNumberOfColumns());
                        }
                    });
                });
            } else {
                AddBlanks(columnsData, grp.getTotalNumberOfColumns());
            }
        });
        return columnsData.toArray();
    }

    public void addRegistrationColumns(List<Object> columnsData, Individual individual, Map<String, FormElement> registrationMap) {
        addStaticRegistrationColumns(columnsData, individual, HeaderCreator.getRegistrationDataMap());
        addAddressLevels(columnsData, individual.getAddressLevel());
        if (individual.getSubjectType().isGroup()) {
            columnsData.add(getTotalMembers(individual));
        }
        columnsData.addAll(getObs(individual.getObservations(), registrationMap));
    }

    private void addStaticRegistrationColumns(List<Object> columnsData, Individual individual,
                                              Map<String, HeaderNameAndFunctionMapper<Individual>> registrationDataMap) {
        exportOutput.getFields().stream()
                .filter(registrationDataMap::containsKey)
                .forEach(key -> columnsData.add(registrationDataMap.get(key).getValueFunction().apply(individual)));
    }

    public void addEnrolmentColumns(List<Object> columnsData, ProgramEnrolment programEnrolment, Map<String, FormElement> enrolmentMap,
                                    Map<String, FormElement> exitEnrolmentMap,
                                    ExportOutput.ExportNestedOutput program) {
        addStaticEnrolmentColumns(program, columnsData, programEnrolment, HeaderCreator.getEnrolmentDataMap());
        columnsData.addAll(getObs(programEnrolment.getObservations(), enrolmentMap));
        columnsData.addAll(getObs(programEnrolment.getObservations(), exitEnrolmentMap));
    }

    public <T extends AbstractEncounter> void addEncounterColumns(Long maxVisitCount, List<Object> columnsData, List<T> encounters,
                                                                  Map<String, FormElement> map, Map<String, FormElement> cancelMap, ExportEntityType encounterEntityType) {
        AtomicInteger counter = new AtomicInteger(0);
        encounters.forEach(encounter -> {
            appendStaticEncounterColumns(encounterEntityType, columnsData, encounter, HeaderCreator.getEncounterDataMap());
            columnsData.addAll(getObs(encounter.getObservations(), map));
            columnsData.addAll(getObs(encounter.getObservations(), cancelMap));
            counter.getAndIncrement();
        });
        int visit = counter.get();
        while (visit++ < maxVisitCount) {
            AddBlanks(columnsData, encounterEntityType.getEffectiveNoOfFields() );
        }
    }

    private void addStaticEnrolmentColumns(ExportOutput.ExportNestedOutput program, List<Object> columnsData, ProgramEnrolment programEnrolment,
                                           Map<String, HeaderNameAndFunctionMapper<ProgramEnrolment>> enrolmentDataMap) {
        program.getFields().stream().filter(enrolmentDataMap::containsKey)
                .forEach(key -> columnsData.add(enrolmentDataMap.get(key).getValueFunction().apply(programEnrolment)));
    }

    private void appendStaticEncounterColumns(ExportEntityType encounterEntityType, List<Object> columnsData, AbstractEncounter encounter,
                                              Map<String, HeaderNameAndFunctionMapper<AbstractEncounter>> encounterDataMap) {
        encounterEntityType.getFields().stream().filter(encounterDataMap::containsKey)
                .forEach(key -> columnsData.add(encounterDataMap.get(key).getValueFunction().apply(encounter)));
    }

    private long getTotalMembers(Individual individual) {
        return individual.getGroupSubjects()
                .stream()
                .filter(gs -> gs.getMembershipEndDate() == null && !gs.getMemberSubject().isVoided())
                .count();
    }

    private List<Object> getObs(ObservationCollection observations, Map<String, FormElement> obsMap) {
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
            } else if (dataType.equals(ConceptDataType.DateTime.toString()) || dataType.equals(ConceptDataType.Date.toString())) {
                values.add(processDateObs(val));
            } else if (ConceptDataType.isMedia(dataType)) {
                values.add(processMediaObs(val));
            } else {
                values.add(headerCreator.quotedStringValue(String.valueOf(Optional.ofNullable(val).orElse(""))));
            }
        });
        return values;
    }

    private DateTime getDateForTimeZone(DateTime dateTime) {
        return dateTime == null ? null : dateTime.withZone(DateTimeZone.forID(timeZone));
    }

    private Object processDateObs(Object val) {
        if (val == null) return "";
        return getDateForTimeZone(new DateTime(String.valueOf(val)));
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
        return headerCreator.quotedStringValue(String.join(",", imageURIs));
    }

    private String getAnsName(Concept concept, Object val) {
        return concept.getSortedAnswers()
                .filter(ca -> ca.getAnswerConcept().getUuid().equals(val))
                .map(ca -> headerCreator.quotedStringValue(ca.getAnswerConcept().getName()))
                .findFirst().orElse("");
    }

    private List<String> getAns(Concept concept, List<Object> val) {
        return concept.getSortedAnswers()
                .map(ca -> val.contains(ca.getAnswerConcept().getUuid()) ? selectedAnswerFieldValue : unSelectedAnswerFieldValue)
                .collect(Collectors.toList());
    }

//    private void addAuditFields(Auditable auditable, List<Object> row) {
//        row.add(auditable.getCreatedBy().getUsername());
//        row.add(getDateForTimeZone(auditable.getCreatedDateTime()));
//        row.add(auditable.getLastModifiedBy().getUsername());
//        row.add(getDateForTimeZone(auditable.getLastModifiedDateTime()));
//    }

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

    private void AddBlanks(List<Object> row, long noOfColumns) {
        for (int i = 0; i < noOfColumns; i++) {
            row.add(EMPTY_STRING);
        }
    }

    private String QuotedStringValue(String text) {
        if (StringUtils.isEmpty(text))
            return text;
        return "\"".concat(text).concat("\"");
    }
}
