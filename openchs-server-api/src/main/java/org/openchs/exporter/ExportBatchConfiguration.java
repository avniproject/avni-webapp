package org.openchs.exporter;

import org.openchs.dao.*;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @Autowired
    public ExportBatchConfiguration(JobBuilderFactory jobBuilderFactory,
                                    StepBuilderFactory stepBuilderFactory,
                                    ProgramEnrolmentRepository programEnrolmentRepository,
                                    IndividualRepository individualRepository,
                                    AuthService authService,
                                    ExportS3Service exportS3Service) {
        this.jobBuilderFactory = jobBuilderFactory;
        this.stepBuilderFactory = stepBuilderFactory;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.individualRepository = individualRepository;
        this.authService = authService;
        this.exportS3Service = exportS3Service;
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
                                               @Value("#{jobParameters['programUUID']}") String programUUID) {
        authService.authenticateByUserId(userId);
        final Map<String, Sort.Direction> sorts = new HashMap<>();
        sorts.put("id", Sort.Direction.ASC);
        if (programUUID != null) {
            List<String> params = new ArrayList<>();
            params.add(programUUID);
            return new RepositoryItemReaderBuilder<Object>()
                    .name("reader")
                    .repository(programEnrolmentRepository)
                    .methodName("findEnrolments")
                    .arguments(params)
                    .pageSize(CHUNK_SIZE)
                    .sorts(sorts)
                    .build();
        } else {
            return new RepositoryItemReaderBuilder<Object>()
                    .name("reader")
                    .repository(individualRepository)
                    .methodName("findIndividuals")
                    .pageSize(CHUNK_SIZE)
                    .sorts(sorts)
                    .build();
        }

    }

}
