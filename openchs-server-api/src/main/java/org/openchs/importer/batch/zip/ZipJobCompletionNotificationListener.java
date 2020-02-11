package org.openchs.importer.batch.zip;


import org.openchs.service.BulkUploadS3Service;
import org.openchs.service.S3Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.configuration.annotation.JobScope;
import org.springframework.batch.core.listener.JobExecutionListenerSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

import static java.lang.String.format;

@Component
@JobScope
public class ZipJobCompletionNotificationListener extends JobExecutionListenerSupport {
    private Logger logger;

    @Value("#{jobParameters['uuid']}")
    private String uuid;

    private BulkUploadS3Service bulkUploadS3Service;

    @Autowired
    public ZipJobCompletionNotificationListener(BulkUploadS3Service bulkUploadS3Service) {
        this.bulkUploadS3Service = bulkUploadS3Service;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        logger.info("BulkUpload with uuid {} {}", jobExecution.getJobParameters().getString("uuid"), jobExecution.getStatus());
        if (jobExecution.getStatus() == BatchStatus.FAILED) {
            try {
                S3Service.ObjectInfo metadata = bulkUploadS3Service.uploadErrorFile(bulkUploadS3Service.getLocalErrorFile(uuid), uuid);
                logger.info(format("BulkUpload '%s'! Check for errors at '%s'", jobExecution.getStatus(), metadata.getKey()));
            } catch (IOException e) {
                e.printStackTrace();
                logger.info("Error while uploading file to S3");
            }
        }
    }

    @Override
    public void beforeJob(JobExecution jobExecution) {
        logger.info("starting BulkUpload with uuid {}", jobExecution.getJobParameters().getString("uuid"));
    }
}
