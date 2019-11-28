package org.openchs.exporter;


import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ExportJobStatus;
import org.openchs.dao.ProgramRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.domain.EncounterType;
import org.openchs.domain.Program;
import org.openchs.domain.SubjectType;
import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
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
    private SubjectTypeRepository subjectTypeRepository;
    private ProgramRepository programRepository;
    private EncounterTypeRepository encounterTypeRepository;

    @Autowired
    public ExportJobService(JobExplorer jobExplorer, Job exportVisitJob, SubjectTypeRepository subjectTypeRepository, ProgramRepository programRepository, EncounterTypeRepository encounterTypeRepository) {
        this.jobExplorer = jobExplorer;
        this.exportVisitJob = exportVisitJob;
        this.subjectTypeRepository = subjectTypeRepository;
        this.programRepository = programRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        logger = LoggerFactory.getLogger(getClass());
    }

    public List<ExportJobStatus> getAll() {
        User user = UserContextHolder.getUserContext().getUser();
        List<JobInstance> importJobInstances = jobExplorer.findJobInstancesByJobName(exportVisitJob.getName(), 0, Integer.MAX_VALUE);
        return importJobInstances.stream()
                .flatMap(x -> jobExplorer.getJobExecutions(x).stream())
                .map(execution -> {
                    ExportJobStatus jobStatus = new ExportJobStatus();
                    JobParameters parameters = execution.getJobParameters();
                    jobStatus.setStartDateParam(parameters.getDate("startDate"));
                    jobStatus.setEndDateParam(parameters.getDate("endDate"));
                    jobStatus.setSubjectTypeName(getSubjectName(parameters.getString("subjectTypeUUID")));
                    jobStatus.setProgramName(getProgramName(parameters.getString("programUUID")));
                    jobStatus.setEncounterTypeName(getEncounterName(parameters.getString("encounterTypeUUID")));
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

    private String getSubjectName(String subjectTypeUUID) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        return subjectType == null ? "" : subjectType.getOperationalSubjectTypeName();
    }

    private String getProgramName(String programUUID) {
        Program program = programRepository.findByUuid(programUUID);
        return program == null ? "" : program.getOperationalProgramName();
    }

    private String getEncounterName(String encounterTypeUUID) {
        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeUUID);
        return encounterType == null ? "" : encounterType.getOperationalEncounterTypeName();
    }
}
