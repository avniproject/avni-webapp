package org.openchs.service;

import org.openchs.excel.DataImportResult;
import org.openchs.excel.data.ImportFile;
import org.openchs.excel.metadata.ImportMetaData;
import org.openchs.excel.metadata.ImportSheetMetaDataList;
import org.openchs.excel.reader.ImportMetaDataExcelReader;
import org.openchs.importer.Importer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataImportService {
    private final Importer importer;

    @Autowired
    public DataImportService(Importer importer) {
        this.importer = importer;
    }

    public void importExcel(InputStream metaDataFileStream, InputStream importDataFileStream) throws IOException {
        DataImportResult dataImportResult = new DataImportResult();
        ImportMetaData importMetaData = ImportMetaDataExcelReader.readMetaData(metaDataFileStream);
        ImportSheetMetaDataList importSheetMetaDataList = importMetaData.getImportSheets();
        ImportFile importFile = new ImportFile(importDataFileStream);
        importSheetMetaDataList.forEach(importSheetMetaData -> {
            try {
                importer.importSheet(importFile, importMetaData, importSheetMetaData, dataImportResult);
            } finally {
                importFile.close();
            }
        });

        dataImportResult.report();
    }
}