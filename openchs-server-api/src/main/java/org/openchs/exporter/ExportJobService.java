package org.openchs.exporter;


import org.openchs.dao.ExportJobStatus;
import org.openchs.dao.JobStatus;
import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.ExportJobRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobInstance;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExportJobService {
    private Logger logger;
    private JobExplorer jobExplorer;
    private Job exportVisitJob;

    @Autowired
    public ExportJobService(JobExplorer jobExplorer, Job exportVisitJob) {
        this.jobExplorer = jobExplorer;
        this.exportVisitJob = exportVisitJob;
        logger = LoggerFactory.getLogger(getClass());
    }

    public List<ExportJobStatus> getAll() {
        User user = UserContextHolder.getUserContext().getUser();
        List<JobInstance> importJobInstances = jobExplorer.findJobInstancesByJobName(exportVisitJob.getName(), 0, Integer.MAX_VALUE);
        return importJobInstances.stream()
                .flatMap(x -> jobExplorer.getJobExecutions(x).stream())
                .map(execution -> {
                    ExportJobStatus jobStatus = new ExportJobStatus();
                    ExportJobRequest request = new ExportJobRequest();
                    JobParameters parameters = execution.getJobParameters();
                    request.setEncounterTypeUUID(parameters.getString("encounterTypeUUID"));
                    request.setProgramUUID(parameters.getString("programUUID"));
                    request.setSubjectTypeUUID(parameters.getString("subjectTypeUUID"));
                    request.setEndDate(parameters.getString("endDate"));
                    request.setStartDate(parameters.getString("startDate"));
                    jobStatus.setRequest(request);
                    jobStatus.setUuid(parameters.getString("uuid"));
                    jobStatus.setFileName(parameters.getString("fileName"));
                    jobStatus.setUserId(parameters.getLong("userId"));
                    jobStatus.setStatus(execution.getStatus());
                    jobStatus.setExitStatus(execution.getExitStatus());
                    jobStatus.setCreateTime(execution.getCreateTime());
                    jobStatus.setStartTime(execution.getStartTime());
                    jobStatus.setEndTime(execution.getEndTime());
                    return jobStatus;
                })
                .filter(status -> user.getId().equals(status.getUserId()))
                .sorted(Comparator.comparing(ExportJobStatus::getCreateTime).reversed())
                .collect(Collectors.toList());
    }
}
