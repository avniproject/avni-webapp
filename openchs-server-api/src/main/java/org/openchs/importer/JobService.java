package org.openchs.importer;

import org.joda.time.DateTime;
import org.springframework.batch.core.*;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Date;
import java.util.UUID;

import static org.springframework.batch.core.BatchStatus.*;

@Service
public class JobService {
    private JobExplorer jobExplorer;
    private JobRepository jobRepository;
    private Job importJob;
    private JobLauncher bgJobLauncher;

    @Autowired
    public JobService(JobExplorer jobExplorer, JobRepository jobRepository, Job importJob, JobLauncher bgJobLauncher) {
        this.jobExplorer = jobExplorer;
        this.jobRepository = jobRepository;
        this.importJob = importJob;
        this.bgJobLauncher = bgJobLauncher;
    }

    public void retryJobsFailedInLast2Hours() throws JobExecutionAlreadyRunningException, JobRestartException, JobInstanceAlreadyCompleteException, JobParametersInvalidException {
        for (JobExecution jobExecution : jobExplorer.findRunningJobExecutions(importJob.getName())) {
            BatchStatus status = jobExecution.getStatus();
            Date lastUpdated = jobExecution.getLastUpdated();
            Date nowMinus2Hours = new DateTime().minusHours(2).toDate();
            if (nowMinus2Hours.before(lastUpdated) && Arrays.asList(STARTING, STARTED, UNKNOWN).contains(status)) {
                jobExecution.upgradeStatus(BatchStatus.FAILED);
                jobExecution.setEndTime(new Date());
                jobRepository.update(jobExecution);
                for (StepExecution stepExecution : jobExecution.getStepExecutions()) {
                    if (Arrays.asList(STARTING, STARTED, UNKNOWN).contains(stepExecution.getStatus())) {
                        stepExecution.upgradeStatus(BatchStatus.FAILED);
                        stepExecution.setEndTime(new Date());
                        jobRepository.update(stepExecution);
                    }
                }
                bgJobLauncher.run(importJob, jobExecution.getJobParameters());
            }
        }
    }

    public JobExecution create(String type, String fileName, Long userId) throws JobParametersInvalidException, JobExecutionAlreadyRunningException, JobRestartException, JobInstanceAlreadyCompleteException {
        JobParameters parameters = new JobParametersBuilder()
                .addString("uuid", UUID.randomUUID().toString())
                .addString("s3Key", fileName)
                .addLong("userId", userId, false)
                .addString("type", type, false)
                .toJobParameters();
        return bgJobLauncher.run(importJob, parameters);
    }
}