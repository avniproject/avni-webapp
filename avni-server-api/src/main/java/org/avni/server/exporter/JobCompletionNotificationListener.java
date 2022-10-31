package org.avni.server.exporter;


import org.avni.server.framework.security.AuthService;
import org.avni.server.service.ExportS3Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.configuration.annotation.JobScope;
import org.springframework.batch.core.listener.JobExecutionListenerSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

@Component
@JobScope
public class JobCompletionNotificationListener extends JobExecutionListenerSupport {
    private static final Logger logger = LoggerFactory.getLogger(JobCompletionNotificationListener.class);

    @Value("#{jobParameters['uuid']}")
    private String uuid;

    @Value("#{jobParameters['userId']}")
    private Long userId;

    @Value("#{jobParameters['organisationUUID']}")
    private String organisationUUID;

    private ExportS3Service exportS3Service;
    private final AuthService authService;

    @Autowired
    public JobCompletionNotificationListener(ExportS3Service exportS3Service, AuthService authService) {
        this.exportS3Service = exportS3Service;
        this.authService = authService;
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
            logger.info("Export Job with uuid {} finished", jobExecution.getJobParameters().getString("uuid"));
            File file = exportS3Service.getLocalExportFile(uuid);
            try {
                exportS3Service.uploadFile(file, uuid);
                logger.info("Uploaded Export Job file {} to s3", uuid.concat(ExportS3Service.FILE_NAME_EXTENSION));
            } catch (IOException e) {
                logger.error("Export Job error in uploading file to S3");
                e.printStackTrace();
            }
        } else {
            logger.info("Job finished with status {}", jobExecution.getStatus());
            for (Throwable t : jobExecution.getAllFailureExceptions()) {
                t.printStackTrace();
            }
        }
    }

    @Override
    public void beforeJob(JobExecution jobExecution) {
        logger.info("starting export job with uuid {}", jobExecution.getJobParameters().getString("uuid"));
        authService.authenticateByUserId(userId, organisationUUID);
    }
}
