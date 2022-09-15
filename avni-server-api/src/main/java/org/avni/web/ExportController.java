package org.avni.web;


import com.fasterxml.jackson.core.type.TypeReference;
import org.apache.commons.io.IOUtils;
import org.avni.dao.JobStatus;
import org.avni.exporter.ExportJobService;
import org.avni.service.ExportS3Service;
import org.avni.util.ObjectMapperSingleton;
import org.avni.web.request.export.ExportJobRequest;
import org.avni.web.request.export.ExportOutput;
import org.avni.web.request.export.ExportV2JobRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.InputStream;

@RestController
public class ExportController {


    private ExportJobService exportJobService;
    private ExportS3Service exportS3Service;

    @Autowired
    public ExportController(ExportJobService exportJobService, ExportS3Service exportS3Service) {
        this.exportJobService = exportJobService;
        this.exportS3Service = exportS3Service;
    }

    @RequestMapping(value = "/export", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> getVisitData(@RequestBody ExportJobRequest exportJobRequest) {
        return exportJobService.runExportJob(exportJobRequest);
    }

    @RequestMapping(value = "/export/v2", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> getVisitDataV2(@RequestBody ExportV2JobRequest exportJobRequest) {
        ResponseEntity<?> validationErrorResponseEntity = validateHeader(exportJobRequest);
        if(validationErrorResponseEntity != null) {
            return validationErrorResponseEntity;
        }
        return exportJobService.runExportV2Job(exportJobRequest);
    }

    private ResponseEntity<?> validateHeader(ExportV2JobRequest exportJobRequest) {
        return ObjectMapperSingleton.getObjectMapper().convertValue(exportJobRequest.getIndividual(), new TypeReference<ExportOutput>() {})
                .validate();
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
