package org.openchs.web;

import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.importer.batch.JobService;
import org.openchs.service.DataImportService;
import org.openchs.service.S3Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import static java.lang.String.format;

@RestController
public class ProgramDataImportController {
    private final DataImportService dataImportService;
    private final Logger logger;
    private final JobService jobService;
    private final S3Service s3Service;

    @Autowired
    public ProgramDataImportController(DataImportService dataImportService, JobLauncher bgJobLauncher, JobRepository jobRepository, Job importJob, JobService jobService, S3Service s3Service) {
        this.dataImportService = dataImportService;
        this.jobService = jobService;
        this.s3Service = s3Service;
        logger = LoggerFactory.getLogger(getClass());
    }

    @RequestMapping(value = "/excelImport", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<?> uploadData(@RequestParam("metaDataFile") MultipartFile metaDataFile,
                                        @RequestParam MultipartFile dataFile,
                                        @RequestParam(required = false) Integer maxNumberOfRecords,
                                        @RequestParam List<Integer> activeSheets) throws Exception {
        dataImportService.importExcel(metaDataFile.getInputStream(), dataFile.getInputStream(), dataFile.getOriginalFilename(), true, maxNumberOfRecords, activeSheets);
        return new ResponseEntity<>(true, HttpStatus.CREATED);
    }

    @PostMapping("/import")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> doit(@RequestParam MultipartFile file,
                                  @RequestParam String type) {
        String uuid = UUID.randomUUID().toString();
        User user = UserContextHolder.getUserContext().getUser();
        try {
            String s3Key = s3Service.uploadFile(uuid, file);
            jobService.create(uuid, type, file.getOriginalFilename(), s3Key, user.getId());
        } catch (JobParametersInvalidException | JobExecutionAlreadyRunningException | JobInstanceAlreadyCompleteException | JobRestartException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(format("Unable to process file. %s", e.getMessage()));
        }
        return ResponseEntity.ok(true);
    }
}
