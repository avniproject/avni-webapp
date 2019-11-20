package org.openchs.exporter;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.listener.JobExecutionListenerSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class JobCompletionNotificationListener extends JobExecutionListenerSupport {
    private Logger logger;

    @Autowired
    public JobCompletionNotificationListener() {
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
            logger.info("Export Job with uuid {} finished", jobExecution.getJobParameters().getString("uuid"));
        } else {
            logger.info("Job finished with status {}", jobExecution.getStatus());
            for (Throwable t : jobExecution.getAllFailureExceptions()) {
                logger.error("some error occurred in the job2 {}", t.getMessage());
            }
        }
    }

    @Override
    public void beforeJob(JobExecution jobExecution) {
        logger.info("starting export job with uuid {}", jobExecution.getJobParameters().getString("uuid"));
    }
}
