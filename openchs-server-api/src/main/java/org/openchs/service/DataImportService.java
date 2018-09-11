package org.openchs.service;

import org.openchs.domain.*;
import org.openchs.domain.individualRelationship.IndividualRelationship;
import org.openchs.excel.DataImportResult;
import org.openchs.excel.data.ImportFile;
import org.openchs.excel.metadata.ImportMetaData;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.excel.metadata.ImportSheetMetaDataList;
import org.openchs.excel.reader.ImportMetaDataExcelReader;
import org.openchs.importer.*;
import org.openchs.web.request.CHSRequest;
import org.openchs.web.validation.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
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
                             ChecklistImporter checklistImporter,
                             IndividualRelationshipImporter individualRelationshipImporter) {
        this.importerMap.put(Individual.class, individualImporter);
        this.importerMap.put(Encounter.class, encounterImporter);
        this.importerMap.put(ProgramEnrolment.class, programEnrolmentImporter);
        this.importerMap.put(ProgramEncounter.class, programEncounterImporter);
        this.importerMap.put(Checklist.class, checklistImporter);
        this.importerMap.put(IndividualRelationship.class, individualRelationshipImporter);
    }

    public Map<ImportSheetMetaData, List<CHSRequest>> importExcel(InputStream metaDataFileStream, InputStream importDataFileStream, String fileName, boolean performImport, Integer maxNumberOfRecords, List<Integer> activeSheets) throws IOException {
        logger.info("\n>>>>Begin Import<<<<\n");
        DataImportResult dataImportResult = new DataImportResult();
        ImportMetaData importMetaData = ImportMetaDataExcelReader.readMetaData(metaDataFileStream);
        ImportSheetMetaDataList importSheetMetaDataList = importMetaData.getImportSheets();

        List<String> errors = importMetaData.compile();
        if (errors.size() != 0) {
            errors.forEach(o -> logger.warn(o));
        }

        ImportFile importFile = new ImportFile(importDataFileStream);
        Map<ImportSheetMetaData, List<CHSRequest>> requestMap = new HashMap<>();
        importSheetMetaDataList
                .forEach(importSheetMetaData -> {
                    if (importSheetMetaData.getFileName().equals(fileName) && (importSheetMetaData.isActive() || activeSheets.contains(importSheetMetaData.getRowNo()))) {
                        logger.info(String.format("Processing virtual sheet: %s", importSheetMetaData));
                        try {
                            List list = this.importerMap.get(importSheetMetaData.getEntityType())
                                    .importSheet(importFile, importMetaData, importSheetMetaData, dataImportResult, performImport, maxNumberOfRecords);
                            requestMap.put(importSheetMetaData, list);
                        } catch (Exception e) {
                            dataImportResult.exceptionHappened(importSheetMetaData.asMap(), e);
                        } finally {
                            importFile.close();
                        }
                    } else {
                        logger.info(String.format("Ignored virtual sheet: %s", importSheetMetaData));
                    }
                });
        logger.info("\n>>>>End Import<<<<\n");
        dataImportResult.report();
        return requestMap;
    }
}