package org.openchs.web;

import org.openchs.dao.JobStatus;
import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.importer.batch.JobService;
import org.openchs.service.BulkUploadS3Service;
import org.openchs.service.ImportService;
import org.openchs.service.OldDataImportService;
import org.openchs.service.S3Service.ObjectInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.PagedResources.PageMetadata;
import org.springframework.hateoas.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static java.lang.String.format;
import static org.springframework.http.MediaType.*;

@RestController
public class ImportController {
    private final OldDataImportService oldDataImportService;
    private final Logger logger;
    private final JobService jobService;
    private final BulkUploadS3Service bulkUploadS3Service;
    private final ImportService importService;

    @Autowired
    public ImportController(OldDataImportService oldDataImportService, JobService jobService, BulkUploadS3Service bulkUploadS3Service, ImportService importService) {
        this.oldDataImportService = oldDataImportService;
        this.jobService = jobService;
        this.bulkUploadS3Service = bulkUploadS3Service;
        this.importService = importService;
        logger = LoggerFactory.getLogger(getClass());
    }

    @RequestMapping(value = "/excelImport", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<?> uploadData(@RequestParam("metaDataFile") MultipartFile metaDataFile,
                                        @RequestParam MultipartFile dataFile,
                                        @RequestParam(required = false) Integer maxNumberOfRecords,
                                        @RequestParam List<Integer> activeSheets) throws Exception {
        oldDataImportService.importExcel(metaDataFile.getInputStream(), dataFile.getInputStream(), dataFile.getOriginalFilename(), true, maxNumberOfRecords, activeSheets);
        return new ResponseEntity<>(true, HttpStatus.CREATED);
    }

    @RequestMapping(value = "/web/importSample", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public void getSampleImportFile(@RequestParam String uploadType, HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + uploadType + ".csv\"");
        response.getWriter().write(importService.getSampleFile(uploadType));
    }

    @RequestMapping(value = "/web/importTypes", method = RequestMethod.GET)
    public ResponseEntity getImportTypes(){
        return ResponseEntity.ok(importService.getImportTypes());
    }

    @PostMapping("/import/new")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public ResponseEntity<?> doit(@RequestParam MultipartFile file,
                                  @RequestParam String type) {
        String uuid = UUID.randomUUID().toString();
        User user = UserContextHolder.getUserContext().getUser();
        try {
            ObjectInfo storedFileInfo = type.equals("metadataZip") ? bulkUploadS3Service.uploadZip(file, uuid) : bulkUploadS3Service.uploadFile(file, uuid);
            jobService.create(uuid, type, file.getOriginalFilename(), storedFileInfo, user.getId());
        } catch (JobParametersInvalidException | JobExecutionAlreadyRunningException | JobInstanceAlreadyCompleteException | JobRestartException e) {
            logger.error(format("Bulkupload initiation failed. file:'%s', user:'%s'", file.getOriginalFilename(), user.getUsername()));
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (IOException e) {
            logger.error(format("Bulkupload initiation failed. file:'%s', user:'%s'", file.getOriginalFilename(), user.getUsername()));
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(format("Unable to process file. %s", e.getMessage()));
        }
        return ResponseEntity.ok(true);
    }

    @GetMapping("/import/status")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public PagedResources<?> getUploadStats(Pageable pageable) {
        List<JobStatus> jobStatuses = jobService.getAll();
        PageMetadata pageMetadata = new PageMetadata(pageable.getPageSize(), pageable.getPageNumber(), jobStatuses.size());
        List<Resource<JobStatus>> pagedContent = jobStatuses
                .stream()
                .skip(pageable.getOffset())
                .limit(pageable.getPageSize())
                .map(it -> new Resource<>(it))
                .collect(Collectors.toList());
        return new PagedResources<>(pagedContent, pageMetadata);
    }

    @GetMapping(value = "/import/errorfile",
            produces = TEXT_PLAIN_VALUE,
            consumes = APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<InputStreamResource> getDocument(@RequestParam String jobUuid) {
        InputStream file = bulkUploadS3Service.downloadErrorFile(jobUuid);
        return ResponseEntity.ok()
                .contentType(TEXT_PLAIN)
                .cacheControl(CacheControl.noCache())
                .header("Content-Disposition", "attachment; ")
                .body(new InputStreamResource(file));
    }
}
