package org.avni.server.web;

import org.avni.server.application.FormElement;
import org.avni.server.dao.JobStatus;
import org.avni.server.dao.application.FormElementRepository;
import org.avni.server.domain.ConceptDataType;
import org.avni.server.domain.JsonObject;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.User;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.importer.batch.JobService;
import org.avni.server.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import static java.lang.String.format;
import static org.springframework.http.MediaType.*;

@RestController
public class ImportController {
    private final OldDataImportService oldDataImportService;
    private final Logger logger;
    private final JobService jobService;
    private final BulkUploadS3Service bulkUploadS3Service;
    private final ImportService importService;
    private final S3Service s3Service;
    private final IndividualService individualService;
    private final LocationService locationService;
    private final FormElementRepository formElementRepository;

    @Autowired
    public ImportController(OldDataImportService oldDataImportService,
                            JobService jobService,
                            BulkUploadS3Service bulkUploadS3Service,
                            ImportService importService,
                            S3Service s3Service,
                            IndividualService individualService,
                            LocationService locationService,
                            FormElementRepository formElementRepository) {
        this.oldDataImportService = oldDataImportService;
        this.jobService = jobService;
        this.bulkUploadS3Service = bulkUploadS3Service;
        this.importService = importService;
        this.s3Service = s3Service;
        this.individualService = individualService;
        this.locationService = locationService;
        this.formElementRepository = formElementRepository;
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
    public ResponseEntity getImportTypes() {
        return ResponseEntity.ok(importService.getImportTypes());
    }

    @PostMapping("/import/new")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public ResponseEntity<?> doit(@RequestParam MultipartFile file,
                                  @RequestParam String type,
                                  @RequestParam boolean autoApprove,
                                  @RequestParam String locationUploadMode) {
        String uuid = UUID.randomUUID().toString();
        User user = UserContextHolder.getUserContext().getUser();
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        try {
            ObjectInfo storedFileInfo = type.equals("metadataZip") ? bulkUploadS3Service.uploadZip(file, uuid) : bulkUploadS3Service.uploadFile(file, uuid);
            jobService.create(uuid, type, file.getOriginalFilename(), storedFileInfo, user.getId(), organisation.getUuid(), autoApprove, locationUploadMode);
        } catch (JobParametersInvalidException | JobExecutionAlreadyRunningException | JobInstanceAlreadyCompleteException | JobRestartException e) {
            logger.error(format("Bulkupload initiation failed. file:'%s', user:'%s'", file.getOriginalFilename(), user.getUsername()));
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (IOException e) {
            logger.error(format("Bulkupload initiation failed. file:'%s', user:'%s'", file.getOriginalFilename(), user.getUsername()));
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(format("Unable to process file. %s", e.getMessage()));
        } catch (Exception e) {
            logger.error(format("Bulkupload initiation failed. file:'%s', user:'%s'", file.getOriginalFilename(), user.getUsername()));
            e.printStackTrace();
            if (!type.equals("metadataZip")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(format("%s does not appear to be a valid .csv file.", file.getOriginalFilename()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(format("Unable to process file. %s", e.getMessage()));
        }
        return ResponseEntity.ok(true);
    }

    @GetMapping("/import/status")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public Page<JobStatus> getUploadStats(Pageable pageable) {
        return jobService.getAll(pageable);
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

    @GetMapping("/upload/media")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public JsonObject uploadMedia(@RequestParam("url") String url,
                                  @RequestParam("oldValue") String oldValue) {
        JsonObject response = new JsonObject();
        String decodedURL = new String(Base64.getDecoder().decode(url));
        try {
            String obsValue = s3Service.getObservationValueForUpload(decodedURL, oldValue);
            response.with("value", obsValue);
        } catch (Exception e) {
            response.with("error", e.getMessage());
        }
        return response;
    }

    @GetMapping("/upload")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public JsonObject getSubjectOrLocationObsValue(@RequestParam("type") String type,
                                                   @RequestParam("ids") String ids,
                                                   @RequestParam("formElementUuid") String formElementUuid) {
        FormElement formElement = formElementRepository.findByUuid(formElementUuid);
        JsonObject response = new JsonObject();
        if (ConceptDataType.Location.toString().equals(type)) {
            response.with("value", locationService.getObservationValueForUpload(formElement, ids));
        } else if (ConceptDataType.Subject.toString().equals(type)) {
            response.with("value", individualService.getObservationValueForUpload(formElement, ids));
        }
        return response;
    }
}
