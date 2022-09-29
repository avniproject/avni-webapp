package org.avni.server.web;


import org.apache.commons.io.IOUtils;
import org.avni.server.dao.JobStatus;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.User;
import org.avni.server.domain.UserContext;
import org.avni.server.exporter.ExportJobService;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.ExportS3Service;
import org.avni.server.web.request.ExportJobRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@RestController
public class ExportController {

    private final Logger logger;
    private Job exportVisitJob;

    private JobLauncher bgJobLauncher;
    private ExportJobService exportJobService;
    private ExportS3Service exportS3Service;

    @Autowired
    public ExportController(Job exportVisitJob, JobLauncher bgJobLauncher, ExportJobService exportJobService, ExportS3Service exportS3Service) {
        this.bgJobLauncher = bgJobLauncher;
        this.exportVisitJob = exportVisitJob;
        this.exportJobService = exportJobService;
        this.exportS3Service = exportS3Service;
        logger = LoggerFactory.getLogger(getClass());
    }

    @RequestMapping(value = "/export", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> getVisitData(@RequestBody ExportJobRequest exportJobRequest) {
        UserContext userContext = UserContextHolder.getUserContext();
        User user = userContext.getUser();
        Organisation organisation = userContext.getOrganisation();
        String mediaDirectory = userContext.getOrganisation().getMediaDirectory();
        if (mediaDirectory == null) {
            String errorMessage = "Information missing. Media Directory for Implementation absent";
            logger.error(errorMessage);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage);
        }
        String jobUUID = UUID.randomUUID().toString();
        JobParameters jobParameters =
                new JobParametersBuilder()
                        .addString("uuid", jobUUID)
                        .addString("organisationUUID", organisation.getUuid())
                        .addLong("userId", user.getId(), false)
                        .addLong("organisationId", organisation.getId())
                        .addString("fileName", jobUUID.concat(ExportS3Service.FILE_NAME_EXTENSION))
                        .addString("programUUID", exportJobRequest.getProgramUUID(), false)
                        .addString("subjectTypeUUID", exportJobRequest.getSubjectTypeUUID(), false)
                        .addString("encounterTypeUUID", exportJobRequest.getEncounterTypeUUID(), false)
                        .addDate("startDate", exportJobRequest.getStartDate(), false)
                        .addDate("endDate", exportJobRequest.getEndDate(), false)
                        .addString("reportType", exportJobRequest.getReportType().name())
                        .addString("addressIds", exportJobRequest.getAddressLevelString())
                        .addString("timeZone", exportJobRequest.getTimeZone())
                        .addString("includeVoided", String.valueOf(exportJobRequest.isIncludeVoided()))
                        .toJobParameters();

        try {
            bgJobLauncher.run(exportVisitJob, jobParameters);
        } catch (JobParametersInvalidException | JobExecutionAlreadyRunningException | JobInstanceAlreadyCompleteException | JobRestartException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
        return ResponseEntity.ok(true);
    }

    @RequestMapping(value = "/export/status", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public Page<JobStatus> getUploadStatus(Pageable pageable) {
        return exportJobService.getAll(pageable);
    }

    @RequestMapping(value = "/export/download", method = RequestMethod.GET)
    public ResponseEntity<?> downloadFile(@RequestParam String fileName) throws IOException {
        InputStream inputStream = exportS3Service.downloadFile(fileName);
        byte[] bytes = IOUtils.toByteArray(inputStream);
        return ResponseEntity.ok()
                .headers(getHttpHeaders(fileName))
                .contentLength(bytes.length)
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(new ByteArrayResource(bytes));
    }

    private HttpHeaders getHttpHeaders(String filename) {
        HttpHeaders header = new HttpHeaders();
        header.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=".concat(filename));
        header.add("Cache-Control", "no-cache, no-store, must-revalidate");
        header.add("Pragma", "no-cache");
        header.add("Expires", "0");
        return header;
    }

}
