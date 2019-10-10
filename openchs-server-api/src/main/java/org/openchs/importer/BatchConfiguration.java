package org.openchs.importer;

import org.openchs.dao.LocationRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.importer.format.Row;
import org.openchs.service.LocationService;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.batch.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;

@Configuration
@EnableBatchProcessing
@EnableScheduling
public class BatchConfiguration {

    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private final LocationProcessor locationProcessor;
    private final LocationService locationService;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final OrganisationRepository organisationRepository;

    @Autowired
    public BatchConfiguration(JobBuilderFactory jobBuilderFactory, StepBuilderFactory stepBuilderFactory, LocationProcessor locationProcessor, LocationService locationService, LocationRepository locationRepository, UserRepository userRepository, OrganisationRepository organisationRepository) {
        this.jobBuilderFactory = jobBuilderFactory;
        this.stepBuilderFactory = stepBuilderFactory;
        this.locationProcessor = locationProcessor;
        this.locationService = locationService;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.organisationRepository = organisationRepository;
    }

    @Bean
    public FlatFileItemReader<Row> rowItemReader() throws IOException {
        ClassPathResource inputFile = new ClassPathResource("sample-data.csv");

        BufferedReader csvReader = new BufferedReader(new InputStreamReader(inputFile.getInputStream()));
        final String[] headers = csvReader.readLine().split(",");
        csvReader.close();

        DefaultLineMapper<Row> lineMapper = new DefaultLineMapper<>();
        lineMapper.setLineTokenizer(new DelimitedLineTokenizer());
        lineMapper.setFieldSetMapper(fieldSet -> new Row(headers, fieldSet.getValues()));

        return new FlatFileItemReaderBuilder<Row>()
                .name("locationReader")
                .resource(inputFile)
                .linesToSkip(1)
                .lineMapper(lineMapper)
                .build();
    }

    @Bean
    public Job importJob(JobCompletionNotificationListener listener, Step importStep) {
        return jobBuilderFactory.get("importJob")
                .incrementer(new RunIdIncrementer())
                .listener(listener)
                .flow(importStep)
                .end()
                .build();
    }

    @Bean
    public Step importStep() throws IOException {
        return stepBuilderFactory.get("importStep")
                .<Row, List<AddressLevel>>chunk(10)
                .reader(rowItemReader())
                .processor(locationProcessor())
                .writer(x -> {
                })
                .build();
    }

    @Bean
    @StepScope
    public LocationProcessor locationProcessor() {
        return new LocationProcessor(locationService, locationRepository, userRepository, organisationRepository);
    }
}