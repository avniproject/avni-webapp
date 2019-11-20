package org.openchs.exporter;

import org.openchs.dao.IndividualRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.framework.security.AuthService;
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
import java.util.HashMap;
import java.util.Map;

import static java.lang.String.format;

@Configuration
@EnableBatchProcessing
public class ExportBatchConfiguration {

    private JobBuilderFactory jobBuilderFactory;

    private StepBuilderFactory stepBuilderFactory;

    private ProgramEnrolmentRepository programEnrolmentRepository;

    private IndividualRepository individualRepository;

    private AuthService authService;

    @Autowired
    public ExportBatchConfiguration(JobBuilderFactory jobBuilderFactory, StepBuilderFactory stepBuilderFactory, ProgramEnrolmentRepository programEnrolmentRepository, IndividualRepository individualRepository, AuthService authService) {
        this.jobBuilderFactory = jobBuilderFactory;
        this.stepBuilderFactory = stepBuilderFactory;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.individualRepository = individualRepository;
        this.authService = authService;
    }

    @Bean
    public Job readCSVFilesJob(JobCompletionNotificationListener listener, Step step1) {
        return jobBuilderFactory
                .get("readCSVFilesJob")
                .incrementer(new RunIdIncrementer())
                .listener(listener)
                .start(step1)
                .build();
    }

    @Bean
    public Step step1(RepositoryItemReader<Object> reader,
                      ExportProcessor exportProcessor,
                      FlatFileItemWriter<ExportItemRow> fileWriter) {
        return stepBuilderFactory.get("step1").<Object, ExportItemRow>chunk(5)
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
        File outputFile;
        File errorDir = new File(format("%s/exports/", System.getProperty("java.io.tmpdir")));
        errorDir.mkdirs();
        outputFile = new File(errorDir, format("%s.csv", uuid));
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
            return new RepositoryItemReaderBuilder<Object>()
                    .name("reader")
                    .repository(programEnrolmentRepository)
                    .methodName("findEnrolments")
                    .sorts(sorts)
                    .build();
        } else {
            return new RepositoryItemReaderBuilder<Object>()
                    .name("reader")
                    .repository(individualRepository)
                    .methodName("findIndividuals")
                    .sorts(sorts)
                    .build();
        }

    }

    @Bean
    public Job exportUserJob(JobCompletionNotificationListener listener, Step step1) {
        return jobBuilderFactory.get("exportUserJob")
                .incrementer(new RunIdIncrementer())
                .listener(listener)
                .flow(step1)
                .end()
                .build();
    }

}
