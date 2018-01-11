package org.openchs.web;

import org.openchs.excel.metadata.ImportMetaData;
import org.openchs.importer.Importer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;

@RestController
public class ProgramDataImportController {
    private final Importer importer;

    @Autowired
    public ProgramDataImportController(Importer importer) {
        this.importer = importer;
    }

    @RequestMapping(value = "/excelImport", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public ResponseEntity<?> uploadData(@RequestParam("file") MultipartFile uploadedFile) throws Exception {
        FileInputStream fileInputStream = new FileInputStream(new File("external", "Data Dictionary.xlsx"));
        try {
            ImportMetaData importMetaData = importer.importImportMetaData(fileInputStream);
            return new ResponseEntity<>(importer.importData(uploadedFile.getInputStream(), importMetaData), HttpStatus.CREATED);
        } finally {
            fileInputStream.close();
        }
    }
}
