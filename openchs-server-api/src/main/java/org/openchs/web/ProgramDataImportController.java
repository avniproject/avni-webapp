package org.openchs.web;

import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.importer.JobService;
import org.openchs.service.DataImportService;
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

import java.util.List;

@RestController
public class ProgramDataImportController {
    private final DataImportService dataImportService;
    private final Logger logger;
    private final JobService jobService;

    @Autowired
    public ProgramDataImportController(DataImportService dataImportService, JobLauncher bgJobLauncher, JobRepository jobRepository, Job importJob, JobService jobService) {
        this.dataImportService = dataImportService;
        this.jobService = jobService;
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

    @GetMapping("/import")
    public ResponseEntity<?> doit(@RequestParam String type) {
        User user = UserContextHolder.getUserContext().getUser();
        try {
            jobService.create(type, "", user.getId());
        } catch (JobParametersInvalidException | JobExecutionAlreadyRunningException | JobInstanceAlreadyCompleteException | JobRestartException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
        logger.info("Import initiated {type='%s',user='%s'}", type, user.getUsername());
        return ResponseEntity.ok(true);
    }
}
