package org.openchs.web;


import org.apache.commons.io.IOUtils;
import org.openchs.dao.ExportJobStatus;
import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.openchs.exporter.ExportJobService;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.ExportS3Service;
import org.openchs.web.request.ExportJobRequest;
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
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
                        .addLong("userId", user.getId(), false)
                        .addLong("organisationId", user.getOrganisationId())
                        .addString("fileName", jobUUID.concat(ExportS3Service.FILE_NAME_EXTENSION))
                        .addString("programUUID", exportJobRequest.getProgramUUID(), false)
                        .addString("subjectTypeUUID", exportJobRequest.getSubjectTypeUUID(), false)
                        .addString("encounterTypeUUID", exportJobRequest.getEncounterTypeUUID(), false)
                        .addDate("startDate", exportJobRequest.getStartDate(), false)
                        .addDate("endDate", exportJobRequest.getEndDate(), false)
                        .addString("reportType", exportJobRequest.getReportType().name())
                        .toJobParameters();

        try {
            bgJobLauncher.run(exportVisitJob, jobParameters);
        } catch (JobParametersInvalidException | JobExecutionAlreadyRunningException | JobInstanceAlreadyCompleteException | JobRestartException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
        return ResponseEntity.ok(true);
    }

    @RequestMapping(value = "/export/status", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public PagedResources<?> getUploadStatus(Pageable pageable) {
        List<ExportJobStatus> jobStatuses = exportJobService.getAll();
        PagedResources.PageMetadata pageMetadata = new PagedResources.PageMetadata(pageable.getPageSize(), pageable.getPageNumber(), jobStatuses.size());
        List<Resource<ExportJobStatus>> pagedContent = jobStatuses
                .stream()
                .skip(pageable.getOffset())
                .limit(pageable.getPageSize())
                .map(it -> new Resource<>(it))
                .collect(Collectors.toList());
        return new PagedResources<>(pagedContent, pageMetadata);
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
