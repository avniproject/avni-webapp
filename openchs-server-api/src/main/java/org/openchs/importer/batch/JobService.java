package org.openchs.importer.batch;

import org.joda.time.DateTime;
import org.openchs.dao.AvniJobRepository;
import org.openchs.dao.JobStatus;
import org.openchs.framework.security.UserContextHolder;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import javax.validation.constraints.NotNull;
import java.util.Arrays;
import java.util.Date;

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
    private AvniJobRepository avniJobRepository;

    @Autowired
    public JobService(JobExplorer jobExplorer, JobRepository jobRepository, Job importJob, Job importZipJob, JobLauncher bgJobLauncher, UserService userService, AvniJobRepository avniJobRepository) {
        this.jobExplorer = jobExplorer;
        this.jobRepository = jobRepository;
        this.importJob = importJob;
        this.importZipJob = importZipJob;
        this.bgJobLauncher = bgJobLauncher;
        this.userService = userService;
        this.avniJobRepository = avniJobRepository;
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

    @Transactional
    public Page<JobStatus> getAll(@NotNull Pageable pageable) {
        String jobFilterCondition = " and subjectTypeUUID = '' ";
        return avniJobRepository.getJobStatuses(UserContextHolder.getUser(), jobFilterCondition, pageable);
    }
}
