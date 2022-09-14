package org.avni.exporter.v2;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.avni.dao.ExportJobParametersRepository;
import org.avni.domain.*;
import org.avni.util.ObjectMapperSingleton;
import org.avni.web.request.export.ExportEntityType;
import org.avni.web.request.export.ExportOutput;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@StepScope
public class ExportV2Processor implements ItemProcessor<Object, ItemRow> {
    private final ExportJobParametersRepository exportJobParametersRepository;
    private final String exportJobParamsUUID;
    private final ObjectMapper objectMapper;
    private ExportJobParameters exportJobParameters;
    private ExportOutput exportOutput;

    public ExportV2Processor(ExportJobParametersRepository exportJobParametersRepository,
                             @Value("#{jobParameters['exportJobParamsUUID']}") String exportJobParamsUUID) {
        this.exportJobParametersRepository = exportJobParametersRepository;
        this.exportJobParamsUUID = exportJobParamsUUID;
        this.objectMapper = ObjectMapperSingleton.getObjectMapper();
    }

    @PostConstruct
    public void init() {
        exportJobParameters = exportJobParametersRepository.findByUuid(exportJobParamsUUID);
    }

    @Override
    public ItemRow process(Object exportItem) throws Exception {
        ItemRow exportItemRow = new ItemRow();
        Individual individual = initIndividual((Individual) exportItem, exportItemRow);
        initGeneralEncounters(exportItemRow, individual);
        initProgramsAndTheirEncounters(exportItemRow, individual);
        initGroupSubjectsAndTheirEncounters(exportItemRow, individual);
        return exportItemRow;
    }

    private Individual initIndividual(Individual exportItem, ItemRow exportItemRow) {
        // Individual would have already passed filters applicable for it
        Individual individual = exportItem;
        exportItemRow.setIndividual(individual);
        return individual;
    }

    private void initGroupSubjectsAndTheirEncounters(ItemRow exportItemRow, Individual individual) {
        // filter GroupSubject by exportOutput
        Map<String, ExportEntityType> groupsToFiltersMap = Optional.ofNullable(exportOutput.getGroups()).orElse(new ArrayList<>())
                .stream().collect(Collectors.toMap(ExportEntityType::getUuid, Function.identity()));
        // filter GroupSubject encounters by exportOutput
        Map<String, ExportEntityType> groupsEncountersToFiltersMap = Optional.ofNullable(exportOutput.getGroups()).orElse(new ArrayList<>())
                .stream().flatMap(p -> p.getEncounters().stream())
                .collect(Collectors.toMap(ExportEntityType::getUuid, Function.identity()));
        Map<Individual, Map<EncounterType, List<Encounter>>> individualToEncountersMap = Optional.ofNullable(individual.getGroupSubjects())
                .orElse(new HashSet<>()).stream()
                .filter(gr -> applyFilters(groupsToFiltersMap, gr.getUuid(), gr.getGroupSubject().getRegistrationDate()
                        .toDateTimeAtStartOfDay(DateTimeZone.forID(exportJobParameters.getTimezone()))))
                .flatMap(gs -> gs.getGroupSubject().getEncounters(false))
                .filter(e -> applyFilters(groupsEncountersToFiltersMap, e.getUuid(), e.getEncounterDateTime()))
                .collect(Collectors.groupingBy(Encounter::getIndividual, Collectors.groupingBy(Encounter::getEncounterType)));
        exportItemRow.setGroupSubjectToEncountersMap(individualToEncountersMap);
    }

    private void initProgramsAndTheirEncounters(ItemRow exportItemRow, Individual individual) {
        // filter ProgramEnrolment by exportOutput
        Map<String, ExportEntityType> programsToFiltersMap = Optional.ofNullable(exportOutput.getPrograms()).orElse(new ArrayList<>())
                .stream().collect(Collectors.toMap(ExportEntityType::getUuid, Function.identity()));
        // filter ProgramEncounters by exportOutput
        Map<String, ExportEntityType> encountersToFiltersMap = Optional.ofNullable(exportOutput.getPrograms()).orElse(new ArrayList<>())
                .stream().flatMap(p -> p.getEncounters().stream())
                .collect(Collectors.toMap(ExportEntityType::getUuid, Function.identity()));
        Map<ProgramEnrolment, Map<EncounterType, List<ProgramEncounter>>> programToEncountersMap = Optional.ofNullable(individual.getProgramEnrolments())
                .orElse(new HashSet<>()).stream()
                .filter(pe -> applyFilters(programsToFiltersMap, pe.getUuid(), pe.getEnrolmentDateTime()))
                .flatMap(pe -> pe.getEncounters(false))
                .filter(e -> applyFilters(encountersToFiltersMap, e.getUuid(), e.getEncounterDateTime()))
                .collect(Collectors.groupingBy(ProgramEncounter::getProgramEnrolment, Collectors.groupingBy(ProgramEncounter::getEncounterType)));
        exportItemRow.setProgramEnrolmentToEncountersMap(programToEncountersMap);
    }

    private void initGeneralEncounters(ItemRow exportItemRow, Individual individual) {
        // filter Encounter by exportOutput
        Map<String, ExportEntityType> generalEncountersToFiltersMap = Optional.ofNullable(exportOutput.getEncounters()).orElse(new ArrayList<>())
                .stream().collect(Collectors.toMap(ExportEntityType::getUuid, Function.identity()));
        Map<EncounterType, List<Encounter>> generalEncounters = Optional.ofNullable(individual.getEncounters()).orElse(new HashSet<>())
                .stream()
                .filter(e -> applyFilters(generalEncountersToFiltersMap, e.getUuid(), e.getEncounterDateTime()))
                .collect(Collectors.groupingBy(Encounter::getEncounterType));
        exportItemRow.setEncounterTypeToEncountersMap(generalEncounters);
    }

    public boolean applyFilters(Map<String, ExportEntityType> entityToFiltersMap, String uuid, DateTime entityDateTime) {
        ExportEntityType entity = entityToFiltersMap.get(uuid);
        if(entity == null) {
            return false;
        } else if(entity.getFilters() == null || entity.getFilters().getDate() == null) {
            return true;
        }
        return entity.getFilters().getDate().apply(entityDateTime);
    }

    public void setExportOutput(ExportOutput exportOutput) {
        this.exportOutput = exportOutput;
    }
}