package org.openchs.exporter;

import org.openchs.dao.IndividualRepository;
import org.openchs.dao.LocationRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.CHSBaseEntity;
import org.openchs.framework.security.AuthService;
import org.openchs.service.ExportS3Service;
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

@Configuration
@EnableBatchProcessing
public class ExportBatchConfiguration {

    private final int CHUNK_SIZE = 100;

    private JobBuilderFactory jobBuilderFactory;

    private StepBuilderFactory stepBuilderFactory;

    private ProgramEnrolmentRepository programEnrolmentRepository;

    private IndividualRepository individualRepository;

    private AuthService authService;

    private ExportS3Service exportS3Service;

    private LocationRepository locationRepository;

    @Autowired
    public ExportBatchConfiguration(JobBuilderFactory jobBuilderFactory,
                                    StepBuilderFactory stepBuilderFactory,
                                    ProgramEnrolmentRepository programEnrolmentRepository,
                                    IndividualRepository individualRepository,
                                    AuthService authService,
                                    ExportS3Service exportS3Service,
                                    LocationRepository locationRepository) {
        this.jobBuilderFactory = jobBuilderFactory;
        this.stepBuilderFactory = stepBuilderFactory;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.individualRepository = individualRepository;
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
                                               @Value("#{jobParameters['addressIds']}") String addressIds) {
        authService.authenticateByUserId(userId, organisationUUID);
        List<Long> locationIds = addressIds.isEmpty() ? Collections.emptyList() : Arrays.stream(addressIds.split(",")).map(Long::valueOf).collect(Collectors.toList());
        List<AddressLevel> selectedAddressLevels = locationRepository.findAllById(locationIds);
        List<AddressLevel> allAddressLevels = locationRepository.findAllByIsVoidedFalse();
        List<Long> selectedAddressIds = selectedAddressLevels
                .stream()
                .flatMap(al -> findLowestAddresses(al, allAddressLevels))
                .map(CHSBaseEntity::getId)
                .collect(Collectors.toList());

        final Map<String, Sort.Direction> sorts = new HashMap<>();
        sorts.put("id", Sort.Direction.ASC);
        List<Long> addressParam = selectedAddressIds.isEmpty() ? null : selectedAddressIds;
        if (programUUID != null) {
            List<Object> params = new ArrayList<>();
            params.add(programUUID);
            params.add(addressParam);
            return new RepositoryItemReaderBuilder<Object>()
                    .name("reader")
                    .repository(programEnrolmentRepository)
                    .methodName("findEnrolments")
                    .arguments(params)
                    .pageSize(CHUNK_SIZE)
                    .sorts(sorts)
                    .build();
        } else {
            List<Object> params = new ArrayList<>();
            params.add(subjectTypeUUID);
            params.add(addressParam);
            return new RepositoryItemReaderBuilder<Object>()
                    .name("reader")
                    .repository(individualRepository)
                    .methodName("findIndividuals")
                    .arguments(params)
                    .pageSize(CHUNK_SIZE)
                    .sorts(sorts)
                    .build();
        }

    }

    private Stream<AddressLevel> findLowestAddresses(AddressLevel selectedAddress, List<AddressLevel> allAddresses) {
        return allAddresses
                .stream()
                .filter(al -> al.getLineage().startsWith(selectedAddress.getLineage()));
    }

}
