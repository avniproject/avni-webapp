package org.openchs.exporter;

import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.framework.security.AuthService;
import org.openchs.util.O;
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

import static java.lang.String.format;

@Configuration
@EnableBatchProcessing
public class ExportBatchConfiguration {

    private JobBuilderFactory jobBuilderFactory;

    private StepBuilderFactory stepBuilderFactory;

    private ProgramEnrolmentRepository programEnrolmentRepository;

    private AuthService authService;

    @Autowired
    public ExportBatchConfiguration(JobBuilderFactory jobBuilderFactory, StepBuilderFactory stepBuilderFactory, ProgramEnrolmentRepository programEnrolmentRepository, AuthService authService) {
        this.jobBuilderFactory = jobBuilderFactory;
        this.stepBuilderFactory = stepBuilderFactory;
        this.programEnrolmentRepository = programEnrolmentRepository;
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
    public Step step1(RepositoryItemReader<ProgramEnrolment> reader,
                      FlatFileItemWriter<ProgramEnrolment> fileWriter) {
        return stepBuilderFactory.get("step1").<ProgramEnrolment, ProgramEnrolment>chunk(5)
                .reader(reader)
                .writer(fileWriter)
                .build();
    }

    @Bean
    @StepScope
    public FlatFileItemWriter<ProgramEnrolment> fileWriter(@Value("#{jobParameters['uuid']}") String uuid,
                                                           ExportCSVFieldExtractor exportCSVFieldExtractor) {
        FlatFileItemWriter<ProgramEnrolment> writer = new FlatFileItemWriter<>();
        File outputFile;
        File errorDir = new File(format("%s/exports/", System.getProperty("java.io.tmpdir")));
        errorDir.mkdirs();
        outputFile = new File(errorDir, format("%s.csv", uuid));
        writer.setResource(new FileSystemResource(outputFile));
        DelimitedLineAggregator<ProgramEnrolment> delimitedLineAggregator = new DelimitedLineAggregator<>();
        delimitedLineAggregator.setDelimiter(",");
        delimitedLineAggregator.setFieldExtractor(exportCSVFieldExtractor);
        writer.setLineAggregator(delimitedLineAggregator);
        writer.setHeaderCallback(exportCSVFieldExtractor);
        return writer;
    }

    @Bean
    @StepScope
    public RepositoryItemReader<ProgramEnrolment> reader(@Value("#{jobParameters['userId']}") Long userId,
                                                         @Value("#{jobParameters['encounterTypeUUID']}") String encounterTypeUUID,
                                                         @Value("#{jobParameters['startDate']}") String startDate,
                                                         @Value("#{jobParameters['endDate']}") String endDate) {
        authService.authenticateByUserId(userId);
        final Map<String, Sort.Direction> sorts = new HashMap<>();
        sorts.put("id", Sort.Direction.ASC);
        List<Object> args1 = new ArrayList<>();
        args1.add(encounterTypeUUID);
        args1.add(O.getDateTimeDbFormat(startDate));
        args1.add(O.getDateTimeDbFormat(endDate));

        return new RepositoryItemReaderBuilder<ProgramEnrolment>()
                .name("reader")
                .repository(programEnrolmentRepository)
                .methodName("findEnrolmentsBetween")
                .sorts(sorts)
                .arguments(args1)
                .build();
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
