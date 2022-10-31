package org.avni.server.importer.batch.zip;


import org.avni.server.framework.security.AuthService;
import org.avni.server.service.BulkUploadS3Service;
import org.avni.server.service.ObjectInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.configuration.annotation.JobScope;
import org.springframework.batch.core.listener.JobExecutionListenerSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

import static java.lang.String.format;

@Component
@JobScope
public class ZipJobCompletionNotificationListener extends JobExecutionListenerSupport {
    private static final Logger logger = LoggerFactory.getLogger(ZipJobCompletionNotificationListener.class);

    @Value("#{jobParameters['uuid']}")
    private String uuid;
    @Value("#{jobParameters['userId']}")
    private Long userId;
    @Value("#{jobParameters['organisationUUID']}")
    private String organisationUUID;

    private final BulkUploadS3Service bulkUploadS3Service;
    private final AuthService authService;

    @Autowired
    public ZipJobCompletionNotificationListener(BulkUploadS3Service bulkUploadS3Service, AuthService authService) {
        this.bulkUploadS3Service = bulkUploadS3Service;
        this.authService = authService;
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        logger.info("BulkUpload with uuid {} {}", jobExecution.getJobParameters().getString("uuid"), jobExecution.getStatus());
        File errorFile = bulkUploadS3Service.getLocalErrorFile(uuid);
        if (errorFile.exists() && errorFile.length() != 0) {
            try {
                ObjectInfo metadata = bulkUploadS3Service.uploadErrorFile(bulkUploadS3Service.getLocalErrorFile(uuid), uuid);
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
        authService.authenticateByUserId(userId, organisationUUID);
    }
}
