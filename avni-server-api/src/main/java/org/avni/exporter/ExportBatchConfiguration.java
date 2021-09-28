package org.avni.exporter;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.avni.dao.*;
import org.avni.domain.AddressLevel;
import org.avni.domain.CHSBaseEntity;
import org.avni.framework.security.AuthService;
import org.avni.service.ExportS3Service;
import org.avni.web.request.ReportType;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.item.data.RepositoryItemReader;
import org.springframework.batch.item.data.builder.RepositoryItemReaderBuilder;
import org.springframework.batch.item.file.FlatFileItemWriter;
import org.springframework.batch.item.file.transform.DelimitedLineAggregator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.data.domain.Sort;

import java.io.File;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.lang.String.format;

@Configuration
@EnableBatchProcessing
public class ExportBatchConfiguration {

    private final int CHUNK_SIZE = 100;
    private JobBuilderFactory jobBuilderFactory;
    private StepBuilderFactory stepBuilderFactory;
    private ProgramEnrolmentRepository programEnrolmentRepository;
    private IndividualRepository individualRepository;
    private GroupSubjectRepository groupSubjectRepository;
    private AuthService authService;
    private ExportS3Service exportS3Service;
    private LocationRepository locationRepository;

    @Autowired
    public ExportBatchConfiguration(JobBuilderFactory jobBuilderFactory,
                                    StepBuilderFactory stepBuilderFactory,
                                    ProgramEnrolmentRepository programEnrolmentRepository,
                                    IndividualRepository individualRepository,
                                    GroupSubjectRepository groupSubjectRepository,
                                    AuthService authService,
                                    ExportS3Service exportS3Service,
                                    LocationRepository locationRepository) {
        this.jobBuilderFactory = jobBuilderFactory;
        this.stepBuilderFactory = stepBuilderFactory;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.individualRepository = individualRepository;
        this.groupSubjectRepository = groupSubjectRepository;
        this.authService = authService;
        this.exportS3Service = exportS3Service;
        this.locationRepository = locationRepository;
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
    public Step step1(RepositoryItemReader<Object> reader,
                      ExportProcessor exportProcessor,
                      FlatFileItemWriter<ExportItemRow> fileWriter) {
        return stepBuilderFactory.get("step1").<Object, ExportItemRow>chunk(CHUNK_SIZE)
                .reader(reader)
                .processor(exportProcessor)
                .writer(fileWriter)
                .build();
    }

    @Bean
    @StepScope
    public FlatFileItemWriter<ExportItemRow> fileWriter(@Value("#{jobParameters['uuid']}") String uuid,
                                                        ExportCSVFieldExtractor exportCSVFieldExtractor) {
        FlatFileItemWriter<ExportItemRow> writer = new FlatFileItemWriter<>();
        File outputFile = exportS3Service.getLocalExportFile(uuid);
        writer.setResource(new FileSystemResource(outputFile));
        DelimitedLineAggregator<ExportItemRow> delimitedLineAggregator = new DelimitedLineAggregator<>();
        delimitedLineAggregator.setDelimiter(",");
        delimitedLineAggregator.setFieldExtractor(exportCSVFieldExtractor);
        writer.setLineAggregator(delimitedLineAggregator);
        writer.setHeaderCallback(exportCSVFieldExtractor);
        return writer;
    }

    @Bean
    @StepScope
    public RepositoryItemReader<Object> reader(@Value("#{jobParameters['userId']}") Long userId,
                                               @Value("#{jobParameters['organisationUUID']}") String organisationUUID,
                                               @Value("#{jobParameters['programUUID']}") String programUUID,
                                               @Value("#{jobParameters['subjectTypeUUID']}") String subjectTypeUUID,
                                               @Value("#{jobParameters['encounterTypeUUID']}") String encounterTypeUUID,
                                               @Value("#{jobParameters['startDate']}") Date startDate,
                                               @Value("#{jobParameters['endDate']}") Date endDate,
                                               @Value("#{jobParameters['reportType']}") String reportType,
                                               @Value("#{jobParameters['addressIds']}") String addressIds) {
        authService.authenticateByUserId(userId, organisationUUID);
        final Map<String, Sort.Direction> sorts = new HashMap<>();
        sorts.put("id", Sort.Direction.ASC);
        List<Long> selectedAddressIds = getLocations(addressIds);
        List<Long> addressParam = selectedAddressIds.isEmpty() ? null : selectedAddressIds;
        switch (ReportType.valueOf(reportType)) {
            case Registration:
                return getRegistrationData(subjectTypeUUID, addressParam, new LocalDate(startDate), new LocalDate(endDate), sorts);
            case Enrolment:
                return getEnrolmentData(programUUID, addressParam, new DateTime(startDate), new DateTime(endDate), sorts);
            case Encounter:
                return getEncounterData(programUUID, encounterTypeUUID, addressParam, new DateTime(startDate), new DateTime(endDate), sorts);
            case GroupSubject:
                return getGroupSubjectData(subjectTypeUUID, addressParam, new LocalDate(startDate), new LocalDate(endDate), sorts);
            default:
                throw new RuntimeException(format("Unknown report type: '%s'", reportType));
        }
    }

    private RepositoryItemReader<Object> getGroupSubjectData(String subjectTypeUUID, List<Long> addressParam, LocalDate startDate, LocalDate endDate, Map<String, Sort.Direction> sorts) {
        List<Object> params = new ArrayList<>();
        params.add(subjectTypeUUID);
        params.add(addressParam);
        params.add(startDate);
        params.add(endDate);
        return new RepositoryItemReaderBuilder<Object>()
                .name("groupSubjectRepositoryReader")
                .repository(groupSubjectRepository)
                .methodName("findGroupSubjects")
                .arguments(params)
                .pageSize(CHUNK_SIZE)
                .sorts(sorts)
                .build();
    }

    private RepositoryItemReader<Object> getEncounterData(String programUUID, String encounterTypeUUID, List<Long> addressParam, DateTime startDateTime, DateTime endDateTime, Map<String, Sort.Direction> sorts) {
        List<Object> params = new ArrayList<>();
        params.add(addressParam);
        params.add(startDateTime);
        params.add(endDateTime);
        params.add(encounterTypeUUID);
        if (programUUID == null) {
            return new RepositoryItemReaderBuilder<Object>()
                    .name("individualRepositoryReader")
                    .repository(individualRepository)
                    .methodName("findEncounters")
                    .arguments(params)
                    .pageSize(CHUNK_SIZE)
                    .sorts(sorts)
                    .build();
        } else {
            params.add(programUUID);
            return new RepositoryItemReaderBuilder<Object>()
                    .name("programEnrolmentRepositoryReader")
                    .repository(programEnrolmentRepository)
                    .methodName("findProgramEncounters")
                    .arguments(params)
                    .pageSize(CHUNK_SIZE)
                    .sorts(sorts)
                    .build();
        }
    }

    private RepositoryItemReader<Object> getEnrolmentData(String programUUID, List<Long> addressParam, DateTime startDateTime, DateTime endDateTime, Map<String, Sort.Direction> sorts) {
        List<Object> params = new ArrayList<>();
        params.add(programUUID);
        params.add(addressParam);
        params.add(startDateTime);
        params.add(endDateTime);
        return new RepositoryItemReaderBuilder<Object>()
                .name("programEnrolmentRepositoryReader")
                .repository(programEnrolmentRepository)
                .methodName("findEnrolments")
                .arguments(params)
                .pageSize(CHUNK_SIZE)
                .sorts(sorts)
                .build();
    }

    private RepositoryItemReader<Object> getRegistrationData(String subjectTypeUUID, List<Long> addressParam, LocalDate startDateTime, LocalDate endDateTime, Map<String, Sort.Direction> sorts) {
        List<Object> params = new ArrayList<>();
        params.add(subjectTypeUUID);
        params.add(addressParam);
        params.add(startDateTime);
        params.add(endDateTime);
        return new RepositoryItemReaderBuilder<Object>()
                .name("individualRepositoryReader")
                .repository(individualRepository)
                .methodName("findIndividuals")
                .arguments(params)
                .pageSize(CHUNK_SIZE)
                .sorts(sorts)
                .build();
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
