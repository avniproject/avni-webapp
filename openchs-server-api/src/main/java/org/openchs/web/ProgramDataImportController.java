package org.openchs.web;

import org.openchs.service.DataImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class ProgramDataImportController {
    private final DataImportService dataImportService;

    @Autowired
    public ProgramDataImportController(DataImportService dataImportService) {
        this.dataImportService = dataImportService;
    }

    @RequestMapping(value = "/excelImport", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user', 'organisation_admin')")
    public ResponseEntity<?> uploadData(@RequestParam("metaDataFile") MultipartFile metaDataFile, @RequestParam("dataFile") MultipartFile dataFile) throws Exception {
        dataImportService.importExcel(metaDataFile.getInputStream(), dataFile.getInputStream(), true);
        return new ResponseEntity<>(true, HttpStatus.CREATED);
    }
}
