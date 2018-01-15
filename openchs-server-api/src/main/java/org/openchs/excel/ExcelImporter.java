package org.openchs.excel;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Individual;
import org.openchs.domain.ProgramEncounter;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.excel.data.ImportFile;
import org.openchs.excel.data.ImportSheet;
import org.openchs.excel.metadata.ImportField;
import org.openchs.excel.metadata.ImportMetaData;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.healthmodule.adapter.HealthModuleInvokerFactory;
import org.openchs.importer.Importer;
import org.openchs.web.request.CHSRequest;
import org.openchs.web.request.IndividualRequest;
import org.openchs.web.request.ProgramEncounterRequest;
import org.openchs.web.request.ProgramEnrolmentRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ExcelImporter implements Importer {
    @Autowired
    private RowProcessor rowProcessor;
    @Autowired
    @Lazy
    private HealthModuleInvokerFactory healthModuleInvokerFactory;
    @Autowired
    private ConceptRepository conceptRepository;

    private static Logger logger = LoggerFactory.getLogger(ExcelImporter.class);


    private boolean isSheetOfType(ImportSheetMetaData importSheetMetaData, Class aClass) {
        return importSheetMetaData.getEntityType().equals(aClass);
    }

    @Override
    public Boolean importSheet(ImportFile importFile, ImportMetaData importMetaData, ImportSheetMetaData importSheetMetaData, DataImportResult dataImportResult) {
        List<ImportField> allFields = importMetaData.getAllFields(importSheetMetaData);
        logger.info(String.format("READING SHEET: %s", importSheetMetaData.getSheetName()));
        ImportSheet importSheet = importFile.getSheet(importSheetMetaData.getSheetName());
        int numberOfDataRows = importSheet.getNumberOfDataRows();
        for (int i = 0; i < numberOfDataRows; i++) {
            try {
                CHSRequest request = importSheet.getRequest(allFields, importSheetMetaData, i, conceptRepository, importMetaData.getAnswerMetaDataList());
                if (request == null) {
                    logger.info(String.format("Breaking at data row number: %d and physical rows number (1 based)", i + 2));
                    break;
                }
                if (isSheetOfType(importSheetMetaData, Individual.class))
                    rowProcessor.processIndividual((IndividualRequest) request);
                else if (isSheetOfType(importSheetMetaData, ProgramEnrolment.class))
                    rowProcessor.processEnrolment((ProgramEnrolmentRequest) request, importSheetMetaData, healthModuleInvokerFactory.getProgramEnrolmentInvoker());
                else if (isSheetOfType(importSheetMetaData, ProgramEncounter.class))
                    rowProcessor.processProgramEncounter((ProgramEncounterRequest) request, importSheetMetaData, healthModuleInvokerFactory.getProgramEncounterInvoker());
                logger.info(String.format("COMPLETED SHEET: %s", importSheetMetaData.getSheetName()));
            } catch (Exception error) {
                dataImportResult.exceptionHappened(error);
                logger.error(error.getMessage(), error);
            }
        }
        return true;
    }
}