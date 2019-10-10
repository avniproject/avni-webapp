package org.openchs.importer;

import org.slf4j.LoggerFactory;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class BackgroundImportService {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(BackgroundImportService.class);
    private final JobLauncher jobLauncher;
    private final Job importJob;

    @Autowired
    public BackgroundImportService(JobLauncher jobLauncher, Job importJob) {
        this.jobLauncher = jobLauncher;
        this.importJob = importJob;
    }

    private void startOrResumeJob() {
        try {
            JobParametersBuilder jobBuilder = new JobParametersBuilder();
            jobBuilder.addString("userId", "2");
            JobParameters jobParameters = jobBuilder.toJobParameters();
            JobExecution execution = jobLauncher.run(importJob, jobParameters);
            logger.info("Completion Status : " + execution.getStatus());
        } catch (Exception e) {
            e.printStackTrace();
            logger.error("Completion Status : Error" + e.getMessage());
        }
    }

    @Scheduled(initialDelay = 1000, fixedDelayString = "${openchs.background.jobs.interval}")
    public void startOrResumeJobOnSchedule() {
        try {
//            startOrResumeJob();
        } catch (Exception e) {
            logger.error(String.format("Job execution failed: '%s'", e.getMessage()));
            e.printStackTrace();
            throw e;
        }
    }
}