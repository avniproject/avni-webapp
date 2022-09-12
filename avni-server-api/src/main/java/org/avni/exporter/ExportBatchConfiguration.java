package org.avni.exporter;

import org.avni.dao.*;
import org.avni.domain.*;
import org.avni.exporter.v2.ExportV2CSVFieldExtractor;
import org.avni.exporter.v2.LongitudinalExportV2TaskletImpl;
import org.avni.framework.security.AuthService;
import org.avni.service.ExportS3Service;
import org.avni.web.request.export.ReportType;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;

import javax.persistence.EntityManager;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.lang.String.format;

@Configuration
@EnableBatchProcessing
public class ExportBatchConfiguration {
    private final int CHUNK_SIZE = 100;
    private final EntityManager entityManager;
    private final ExportJobParametersRepository exportJobParametersRepository;
    private JobBuilderFactory jobBuilderFactory;
    private StepBuilderFactory stepBuilderFactory;
    private ProgramEnrolmentRepository programEnrolmentRepository;
    private IndividualRepository individualRepository;
    private GroupSubjectRepository groupSubjectRepository;
    private AuthService authService;
    private ExportS3Service exportS3Service;
    private LocationRepository locationRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private EncounterTypeRepository encounterTypeRepository;
    private ProgramRepository programRepository;

    @Autowired
    public ExportBatchConfiguration(JobBuilderFactory jobBuilderFactory,
                                    StepBuilderFactory stepBuilderFactory,
                                    ProgramEnrolmentRepository programEnrolmentRepository,
                                    IndividualRepository individualRepository,
                                    GroupSubjectRepository groupSubjectRepository,
                                    AuthService authService,
                                    ExportS3Service exportS3Service,
                                    LocationRepository locationRepository,
                                    SubjectTypeRepository subjectTypeRepository,
                                    EncounterTypeRepository encounterTypeRepository,
                                    ProgramRepository programRepository,
                                    EntityManager entityManager,
                                    ExportJobParametersRepository exportJobParametersRepository) {
        this.jobBuilderFactory = jobBuilderFactory;
        this.stepBuilderFactory = stepBuilderFactory;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.individualRepository = individualRepository;
        this.groupSubjectRepository = groupSubjectRepository;
        this.authService = authService;
        this.exportS3Service = exportS3Service;
        this.locationRepository = locationRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.programRepository = programRepository;
        this.entityManager = entityManager;
        this.exportJobParametersRepository = exportJobParametersRepository;
    }

    @Bean
    public Job exportVisitJob(JobCompletionNotificationListener listener, Step step1) {
        return jobBuilderFactory
                .get("exportVisitJob")
                .incrementer(new RunIdIncrementer())
                .listener(listener)
                .start(step1)
                .build();
    }

    @Bean
    public Job exportV2Job(JobCompletionNotificationListener listener, Step exportV2Step) {
        return jobBuilderFactory
                .get("exportVisitJob")
                .incrementer(new RunIdIncrementer())
                .listener(listener)
                .start(exportV2Step)
                .build();
    }

    @Bean
    public Step exportV2Step(Tasklet exportV2Tasklet,
                             LongitudinalExportJobStepListener listener) {
        return stepBuilderFactory.get("step1")
                .tasklet(exportV2Tasklet)
                .listener(listener)
                .build();
    }

    @Bean
    @StepScope
    public Tasklet exportV2Tasklet(@Value("#{jobParameters['uuid']}") String uuid,
                                   @Value("#{jobParameters['userId']}") Long userId,
                                   @Value("#{jobParameters['organisationUUID']}") String organisationUUID,
                                   @Value("#{jobParameters['exportJobParamsUUID']}") String exportJobParamsUUID,
                                   LongitudinalExportJobStepListener listener,
                                   ExportV2CSVFieldExtractor exportV2CSVFieldExtractor) {
        authService.authenticateByUserId(userId, organisationUUID);
        ExportJobParameters exportJobParameters = exportJobParametersRepository.findByUuid(exportJobParamsUUID);
        Stream stream = null;
        LongitudinalExportTasklet encounterTasklet = new LongitudinalExportV2TaskletImpl(CHUNK_SIZE, entityManager, exportV2CSVFieldExtractor, exportS3Service, uuid, stream);
        listener.setItemReaderCleaner(encounterTasklet);
        return encounterTasklet;
    }

    @Bean
    public Step step1(Tasklet tasklet,
                      LongitudinalExportJobStepListener listener) {
        return stepBuilderFactory.get("step1")
                .tasklet(tasklet)
                .listener(listener)
                .build();
    }

    @Bean
    @StepScope
    public Tasklet tasklet(@Value("#{jobParameters['uuid']}") String uuid,
                           @Value("#{jobParameters['userId']}") Long userId,
                           @Value("#{jobParameters['organisationUUID']}") String organisationUUID,
                           @Value("#{jobParameters['programUUID']}") String programUUID,
                           @Value("#{jobParameters['subjectTypeUUID']}") String subjectTypeUUID,
                           @Value("#{jobParameters['encounterTypeUUID']}") String encounterTypeUUID,
                           @Value("#{jobParameters['startDate']}") Date startDate,
                           @Value("#{jobParameters['endDate']}") Date endDate,
                           @Value("#{jobParameters['reportType']}") String reportType,
                           @Value("#{jobParameters['addressIds']}") String addressIds,
                           @Value("#{jobParameters['includeVoided']}") String includeVoided,
                           LongitudinalExportJobStepListener listener,
                           ExportCSVFieldExtractor exportCSVFieldExtractor,
                           ExportProcessor exportProcessor) {
        authService.authenticateByUserId(userId, organisationUUID);
        final Map<String, Sort.Direction> sorts = new HashMap<>();
        sorts.put("id", Sort.Direction.ASC);
        List<Long> selectedAddressIds = getLocations(addressIds);
        List<Long> addressParam = selectedAddressIds.isEmpty() ? null : selectedAddressIds;
        boolean isVoidedIncluded = Boolean.parseBoolean(includeVoided);
        Stream stream;
        switch (ReportType.valueOf(reportType)) {
            case Registration:
                stream = getRegistrationStream(subjectTypeUUID, addressParam, new LocalDate(startDate), new LocalDate(endDate), isVoidedIncluded);
                break;
            case Enrolment:
                stream = getEnrolmentStream(programUUID, addressParam, new DateTime(startDate), new DateTime(endDate), isVoidedIncluded);
                break;
            case Encounter:
                stream = getEncounterStream(programUUID, encounterTypeUUID, addressParam, new DateTime(startDate), new DateTime(endDate), isVoidedIncluded);
                break;
            case GroupSubject:
                stream = getGroupSubjectStream(subjectTypeUUID, addressParam, new LocalDate(startDate), new LocalDate(endDate), sorts, isVoidedIncluded);
                break;
            default:
                throw new RuntimeException(format("Unknown report type: '%s'", reportType));
        }

        LongitudinalExportTasklet encounterTasklet = new LongitudinalExportTaskletImpl(CHUNK_SIZE, entityManager, exportCSVFieldExtractor, exportProcessor, exportS3Service, uuid, stream);
        listener.setItemReaderCleaner(encounterTasklet);
        return encounterTasklet;
    }

    private Stream getGroupSubjectStream(String subjectTypeUUID, List<Long> addressParam, LocalDate startDate, LocalDate endDate, Map<String, Sort.Direction> sorts, boolean isVoidedIncluded) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        return isVoidedIncluded ? groupSubjectRepository.findAllGroupSubjects(subjectType.getId(), addressParam, startDate, endDate) :
                groupSubjectRepository.findNonVoidedGroupSubjects(subjectType.getId(), addressParam, startDate, endDate);
    }

    private Stream getEncounterStream(String programUUID, String encounterTypeUUID, List<Long> addressParam, DateTime startDateTime, DateTime endDateTime, boolean isVoidedIncluded) {
        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeUUID);
        if (programUUID == null) {
            return isVoidedIncluded ? individualRepository.findAllEncounters(addressParam, startDateTime, endDateTime, encounterType.getId()) :
                    individualRepository.findNonVoidedEncounters(addressParam, startDateTime, endDateTime, encounterType.getId());
        } else {
            Program program = programRepository.findByUuid(programUUID);
            return isVoidedIncluded ? programEnrolmentRepository.findAllProgramEncounters(addressParam, startDateTime, endDateTime, encounterType.getId(), program.getId()) :
                    programEnrolmentRepository.findNonVoidedProgramEncounters(addressParam, startDateTime, endDateTime, encounterType.getId(), program.getId());
        }
    }

    private Stream getEnrolmentStream(String programUUID, List<Long> addressParam, DateTime startDateTime, DateTime endDateTime, boolean isVoidedIncluded) {
        Program program = programRepository.findByUuid(programUUID);
        return isVoidedIncluded ? programEnrolmentRepository.findAllEnrolments(program.getId(), addressParam, startDateTime, endDateTime) :
                programEnrolmentRepository.findNonVoidedEnrolments(program.getId(), addressParam, startDateTime, endDateTime);
    }

    private Stream getRegistrationStream(String subjectTypeUUID, List<Long> addressParam, LocalDate startDateTime, LocalDate endDateTime, boolean includeVoided) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        return includeVoided ? individualRepository.findAllIndividuals(subjectType.getId(), addressParam, startDateTime, endDateTime) :
                individualRepository.findNonVoidedIndividuals(subjectType.getId(), addressParam, startDateTime, endDateTime);
    }

    private List<Long> getLocations(@Value("#{jobParameters['addressIds']}") String addressIds) {
        List<Long> locationIds = addressIds.isEmpty() ? Collections.emptyList() : Arrays.stream(addressIds.split(",")).map(Long::valueOf).collect(Collectors.toList());
        List<AddressLevel> selectedAddressLevels = locationRepository.findAllById(locationIds);
        List<AddressLevel> allAddressLevels = locationRepository.findAllByIsVoidedFalse();
        return selectedAddressLevels
                .stream()
                .flatMap(al -> findLowestAddresses(al, allAddressLevels))
                .map(CHSBaseEntity::getId)
                .collect(Collectors.toList());
    }

    private Stream<AddressLevel> findLowestAddresses(AddressLevel selectedAddress, List<AddressLevel> allAddresses) {
        return allAddresses
                .stream()
                .filter(al -> al.getLineage().startsWith(selectedAddress.getLineage()));
    }

}
