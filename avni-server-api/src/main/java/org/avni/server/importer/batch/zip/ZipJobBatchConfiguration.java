package org.avni.server.importer.batch.zip;

import org.avni.server.importer.batch.model.BundleFile;
import org.avni.server.service.S3Service;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.file.FlatFileParseException;
import org.springframework.batch.item.file.transform.FlatFileFormatException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.FileNotFoundException;
import java.io.IOException;

@Configuration
@EnableBatchProcessing
@EnableScheduling
public class ZipJobBatchConfiguration {
    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private final S3Service s3Service;

    @Autowired
    public ZipJobBatchConfiguration(JobBuilderFactory jobBuilderFactory, StepBuilderFactory stepBuilderFactory,
                                    @Qualifier("BatchS3Service") S3Service s3Service) {
        this.jobBuilderFactory = jobBuilderFactory;
        this.stepBuilderFactory = stepBuilderFactory;
        this.s3Service = s3Service;
    }

    @Bean
    @StepScope
    public ItemReader<BundleFile> zipItemReader(@Value("#{jobParameters['s3Key']}") String s3Key) throws IOException {
        return new ZipItemReader(s3Service.getObjectContent(s3Key));
    }

    @Bean
    public Job importZipJob(Step importZipStep, ZipJobCompletionNotificationListener zipJobCompletionNotificationListener) {
        return jobBuilderFactory.get("importZipJob")
                .incrementer(new RunIdIncrementer())
                .listener(zipJobCompletionNotificationListener)
                .flow(importZipStep)
                .end()
                .build();
    }

    @Bean
    public Step importZipStep(ZipErrorFileWriterListener zipErrorFileWriterListener, ItemReader<BundleFile> zipItemReader, ZipFileWriter zipFileWriter) {
        return stepBuilderFactory.get("importZipStep")
                .<BundleFile, BundleFile>chunk(100)
                .reader(zipItemReader)
                .writer(zipFileWriter)
                .faultTolerant()
                .skip(Exception.class)
                .noSkip(FileNotFoundException.class)
                .noSkip(FlatFileParseException.class)
                .noSkip(FlatFileFormatException.class)
                .skipPolicy((error, count) -> true)
                .listener(zipErrorFileWriterListener)
                .build();
    }
}
