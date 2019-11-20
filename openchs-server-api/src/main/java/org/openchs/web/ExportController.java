package org.openchs.web;


import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.*;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class ExportController {

    private final Logger logger;
    private Job readCSVFilesJob;

    @Qualifier("jobLauncher")
    private JobLauncher jobLauncher;

    public ExportController(Job readCSVFilesJob, JobLauncher jobLauncher) {
        this.jobLauncher = jobLauncher;
        this.readCSVFilesJob = readCSVFilesJob;
        logger = LoggerFactory.getLogger(getClass());
    }

    @RequestMapping(value = "/export", method = RequestMethod.GET)
    ///TODO:remove user
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public ResponseEntity<?> getVisitData(@RequestParam String encounterTypeUUID,
                                          @RequestParam(required = false) String programUUID,
                                          @RequestParam String subjectTypeUUID,
                                          @RequestParam String startDate,
                                          @RequestParam String endDate) {
        User user = UserContextHolder.getUserContext().getUser();
        JobParameters jobParameters =
                new JobParametersBuilder()
                        .addString("uuid", UUID.randomUUID().toString())
                        .addLong("userId", user.getId(), false)
                        .addString("programUUID", programUUID, false)
                        .addString("subjectTypeUUID", subjectTypeUUID, false)
                        .addString("encounterTypeUUID", encounterTypeUUID, false)
                        .addString("startDate", startDate, false)
                        .addString("endDate", endDate, false)
                        .toJobParameters();

        try {
            jobLauncher.run(readCSVFilesJob, jobParameters);
        } catch (JobParametersInvalidException | JobExecutionAlreadyRunningException | JobInstanceAlreadyCompleteException | JobRestartException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
        return ResponseEntity.ok(true);
    }

}
