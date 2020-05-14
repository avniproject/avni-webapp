package org.openchs.importer.batch;

import org.joda.time.DateTime;
import org.openchs.dao.JobStatus;
import org.openchs.service.S3Service;
import org.openchs.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.lang.String.format;
import static org.springframework.batch.core.BatchStatus.*;

@Service
public class JobService {
    private Logger logger;
    private JobExplorer jobExplorer;
    private JobRepository jobRepository;
    private Job importJob;
    private Job importZipJob;
    private JobLauncher bgJobLauncher;
    private UserService userService;

    @Autowired
    public JobService(JobExplorer jobExplorer, JobRepository jobRepository, Job importJob, Job importZipJob, JobLauncher bgJobLauncher, UserService userService) {
        this.jobExplorer = jobExplorer;
        this.jobRepository = jobRepository;
        this.importJob = importJob;
        this.importZipJob = importZipJob;
        this.bgJobLauncher = bgJobLauncher;
        this.userService = userService;
        logger = LoggerFactory.getLogger(getClass());
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

    public JobExecution create(String uuid, String type, String fileName, S3Service.ObjectInfo s3FileInfo, Long userId, String organisationUUID) throws JobParametersInvalidException, JobExecutionAlreadyRunningException, JobRestartException, JobInstanceAlreadyCompleteException {
        JobParameters parameters = new JobParametersBuilder()
                .addString("organisationUUID", organisationUUID)
                .addString("uuid", uuid)
                .addString("fileName", fileName, false)
                .addString("s3Key", s3FileInfo.getKey(), false)
                .addLong("noOfLines", s3FileInfo.getNoOfLines(), false)
                .addLong("userId", userId, false)
                .addString("type", type, false)
                .toJobParameters();
        logger.info(format("Bulkupload initiated! Job{type='%s',uuid='%s',fileName='%s'}", type, uuid, fileName));

        return type.equals("metadataZip") ? bgJobLauncher.run(importZipJob, parameters) : bgJobLauncher.run(importJob, parameters);
    }

    public List<JobStatus> getAll() {
        Long currentUserId = userService.getCurrentUser().getId();
        List<JobInstance> importJobInstances = jobExplorer.findJobInstancesByJobName(importJob.getName(), 0, Integer.MAX_VALUE);
        List<JobInstance> zipImportJobInstances = jobExplorer.findJobInstancesByJobName(importZipJob.getName(), 0, Integer.MAX_VALUE);
        return Stream.concat(importJobInstances.stream(), zipImportJobInstances.stream())
                .flatMap(x -> jobExplorer.getJobExecutions(x).stream())
                .map(execution -> {
                    JobStatus jobStatus = new JobStatus();
                    JobParameters parameters = execution.getJobParameters();
                    jobStatus.setUuid(parameters.getString("uuid"));
                    jobStatus.setFileName(parameters.getString("fileName"));
                    jobStatus.setNoOfLines(parameters.getLong("noOfLines"));
                    jobStatus.setS3Key(parameters.getString("s3Key"));
                    jobStatus.setUserId(parameters.getLong("userId"));
                    jobStatus.setType(parameters.getString("type"));
                    jobStatus.setStatus(execution.getStatus());
                    jobStatus.setExitStatus(execution.getExitStatus());
                    jobStatus.setCreateTime(execution.getCreateTime());
                    jobStatus.setStartTime(execution.getStartTime());
                    jobStatus.setEndTime(execution.getEndTime());
                    execution.getStepExecutions()
                            .stream()
                            .filter(it -> "importStep".equals(it.getStepName()) || "importZipStep".equals(it.getStepName()))
                            .findFirst()
                            .ifPresent(step -> {
                                jobStatus.setTotal(step.getReadCount());
                                jobStatus.setCompleted(step.getWriteCount());
                                jobStatus.setSkipped(step.getWriteSkipCount());
                            });
                    return jobStatus;
                })
                .filter(status -> currentUserId.equals(status.getUserId()))
                .sorted(Comparator.comparing(JobStatus::getCreateTime).reversed())
                .collect(Collectors.toList());
    }
}
