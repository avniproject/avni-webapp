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

    private static final Logger log = LoggerFactory.getLogger(JobCompletionNotificationListener.class);


    @Autowired
    public JobCompletionNotificationListener() {
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
            log.info("!!! JOB FINISHED! Time to verify the results {}", jobExecution.getJobConfigurationName());
        } else {
            log.error("some error occurred in the job {}", jobExecution.getStatus());
            for (Throwable t : jobExecution.getAllFailureExceptions()) {
                log.error("some error occurred in the job2 {}", t.getMessage());
                log.error("some error occurred in the job2 {}", t.getStackTrace());
            }
        }
    }

    @Override
    public void beforeJob(JobExecution jobExecution) {
        log.info("starting the actual JOB with id {} name {}", jobExecution.getJobId(), jobExecution.getJobConfigurationName());
    }
}
