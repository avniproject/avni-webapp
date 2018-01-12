package org.openchs.web;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.openchs.excel.data.ImportFile;
import org.openchs.excel.metadata.ImportMetaData;
import org.openchs.excel.metadata.ImportSheetMetaDataList;
import org.openchs.excel.reader.ImportMetaDataExcelReader;
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

@RestController
public class ProgramDataImportController {
    private final Importer importer;

    @Autowired
    public ProgramDataImportController(Importer importer) {
        this.importer = importer;
    }

    @RequestMapping(value = "/excelImport", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public ResponseEntity<?> uploadData(@RequestParam("file") MultipartFile importMetaDataFile, @RequestParam("file") MultipartFile uploadedFile) throws Exception {
        ImportMetaData importMetaData = ImportMetaDataExcelReader.readMetaData(importMetaDataFile.getInputStream());
        ImportSheetMetaDataList importSheetMetaDataList = importMetaData.getImportSheets();
        ImportFile importFile = new ImportFile(uploadedFile.getInputStream());
        importSheetMetaDataList.forEach(importSheetMetaData -> {
            try {
                Boolean status = importer.importSheet(importFile, importMetaData, importSheetMetaData);
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                importFile.close();
            }
        });

        return new ResponseEntity<>(true, HttpStatus.CREATED);
    }
}
