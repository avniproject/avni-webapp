package org.openchs.service;

import org.openchs.domain.*;
import org.openchs.excel.DataImportResult;
import org.openchs.excel.data.ImportFile;
import org.openchs.excel.metadata.ImportMetaData;
import org.openchs.excel.metadata.ImportSheetMetaDataList;
import org.openchs.excel.reader.ImportMetaDataExcelReader;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.importer.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Component
public class DataImportService {
    private static Logger logger = LoggerFactory.getLogger(DataImportService.class);
    private final Map<Class, Importer> importerMap = new HashMap<>();

    @Autowired
    public DataImportService(IndividualImporter individualImporter,
                             EncounterImporter encounterImporter,
                             ProgramEnrolmentImporter programEnrolmentImporter,
                             ProgramEncounterImporter programEncounterImporter,
                             ChecklistImporter checklistImporter) {
        this.importerMap.put(Individual.class, individualImporter);
        this.importerMap.put(Encounter.class, encounterImporter);
        this.importerMap.put(ProgramEnrolment.class, programEnrolmentImporter);
        this.importerMap.put(ProgramEncounter.class, programEncounterImporter);
        this.importerMap.put(Checklist.class, checklistImporter);
    }

    public void importExcel(InputStream metaDataFileStream, InputStream importDataFileStream) throws IOException {
        logger.info("\n>>>>Begin Import<<<<\n");
        DataImportResult dataImportResult = new DataImportResult();
        ImportMetaData importMetaData = ImportMetaDataExcelReader.readMetaData(metaDataFileStream);
        ImportSheetMetaDataList importSheetMetaDataList = importMetaData.getImportSheets();
        ImportFile importFile = new ImportFile(importDataFileStream);
        importSheetMetaDataList
                .forEach(importSheetMetaData -> {
                    try {
                        this.importerMap.get(importSheetMetaData.getEntityType())
                                .importSheet(importFile, importMetaData, importSheetMetaData, dataImportResult);
                    } catch (Exception e) {
                        dataImportResult.exceptionHappened(importSheetMetaData.asMap(), e);
                    } finally {
                        importFile.close();
                    }
                });
        logger.info("\n>>>>End Import<<<<\n");
        dataImportResult.report();
    }
}