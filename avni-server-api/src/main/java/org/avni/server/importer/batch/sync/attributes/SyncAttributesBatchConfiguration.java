package org.avni.server.importer.batch.sync.attributes;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.launch.support.SimpleJobLauncher;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableBatchProcessing
public class SyncAttributesBatchConfiguration {
    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private final JobRepository jobRepository;

    @Autowired
    public SyncAttributesBatchConfiguration(JobBuilderFactory jobBuilderFactory,
                                            StepBuilderFactory stepBuilderFactory,
                                            JobRepository jobRepository) {
        this.jobBuilderFactory = jobBuilderFactory;
        this.stepBuilderFactory = stepBuilderFactory;
        this.jobRepository = jobRepository;
    }

    @Bean
    public JobLauncher syncAttributesJobLauncher() {
        return new SimpleJobLauncher() {{
            setJobRepository(jobRepository);
            setTaskExecutor(new ThreadPoolTaskExecutor() {{
                setCorePoolSize(1);
                setMaxPoolSize(1);
                setQueueCapacity(100);
                initialize();
            }});
        }};
    }


    @Bean
    public Job syncAttributesJob(SyncAttributesJobListener listener, Step updateSyncAttributesStep) {
        return jobBuilderFactory
                .get("syncAttributesJob")
                .incrementer(new RunIdIncrementer())
                .listener(listener)
                .start(updateSyncAttributesStep)
                .build();
    }

    @Bean
    public Step updateSyncAttributesStep(UpdateSyncAttributesTasklet tasklet) {
        return stepBuilderFactory.get("updateSyncAttributesStep")
                .tasklet(tasklet)
                .build();
    }
}


