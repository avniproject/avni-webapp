package org.openchs.importer.batch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.listener.JobExecutionListenerSupport;
import org.springframework.stereotype.Component;

import static java.lang.String.format;

@Component
public class AfterJobExecutionListener extends JobExecutionListenerSupport {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Override
    public void afterJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
            logger.info(format("Bulkupload completed! Job{type='%s',uuid='%s',fileName='%s'}",
                    jobExecution.getJobParameters().getString("type"),
                    jobExecution.getJobParameters().getString("uuid"),
                    jobExecution.getJobParameters().getString("fileName")
            ));
        }
    }
}