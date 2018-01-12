package org.openchs.excel;

import org.apache.logging.log4j.util.Strings;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.openchs.domain.Individual;
import org.openchs.domain.ProgramEncounter;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.excel.metadata.ImportField;
import org.openchs.excel.metadata.ImportMetaData;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.healthmodule.adapter.HealthModuleInvokerFactory;
import org.openchs.importer.Importer;
import org.openchs.util.ExceptionUtil;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;

@Component
public class ExcelImporter implements Importer {
    private final org.slf4j.Logger logger;
    @Autowired
    private RowProcessor rowProcessor;
    @Autowired
    @Lazy
    private HealthModuleInvokerFactory healthModuleInvokerFactory;

    public ExcelImporter() {
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public void rowImport(Row row, ImportSheetHeader importSheetHeader, HashSet<Integer> uniqueErrorHashes, ImportMetaData importMetaData, ImportSheetMetaData sheetMetaData, List<ImportField> importFields) {
        if (isSheetOfType(sheetMetaData, Individual.class))
            rowProcessor.processIndividual(row, importSheetHeader, importFields, sheetMetaData);
        else if (isSheetOfType(sheetMetaData, ProgramEnrolment.class))
            rowProcessor.processEnrolment(row, importSheetHeader, importFields, sheetMetaData, healthModuleInvokerFactory.getProgramEnrolmentInvoker());
        else if (isSheetOfType(sheetMetaData, ProgramEncounter.class))
            rowProcessor.processProgramEncounter(row, importSheetHeader, importFields, sheetMetaData, healthModuleInvokerFactory.getProgramEncounterInvoker());
    }

    private boolean isSheetOfType(ImportSheetMetaData importSheetMetaData, Class aClass) {
        return importSheetMetaData.getEntityType().equals(aClass);
    }

    @Override
    public Boolean importSheet(XSSFWorkbook workbook, ImportMetaData importMetaData, ImportSheetMetaData importSheetMetaData) throws Exception {
        int errorCount = 0;
        HashSet<Integer> uniqueErrorHashes = new HashSet<>();
        try {
            workbook.getSheetAt(1);
            XSSFSheet sheet = workbook.getSheet(importSheetMetaData.getSheetName());
            List<ImportField> allFields = importMetaData.getAllFields(importSheetMetaData);
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                logger.info(String.format("READING SHEET: %s", importSheetMetaData.getSheetName()));
                XSSFRow firstRow = sheet.getRow(0);
                Iterator<Row> iterator = sheet.iterator();
                int k = 0;
                ImportSheetHeader importSheetHeader = null;
                while (iterator.hasNext()) {
                    k++;
                    Row row = iterator.next();
                    if (k == 1) {
                        importSheetHeader = new ImportSheetHeader(firstRow);
                        continue;
                    }
                    String rawCellValue = ExcelUtil.getRawCellValue(row, 0);
                    if (Strings.isBlank(rawCellValue)) {
                        logger.info(String.format("Breaking at row number: %d", k));
                        break;
                    }
                    this.rowImport(row, importSheetHeader, uniqueErrorHashes, importMetaData, importSheetMetaData, allFields);
                }
                logger.info(String.format("COMPLETED SHEET: %s", sheet.getSheetName()));
            }
        } catch (Exception error) {
            int exceptionHash = ExceptionUtil.getExceptionHash(error);
            uniqueErrorHashes.add(exceptionHash);
            errorCount++;
            logger.error(error.getMessage(), error);
            throw error;
        } finally {
            logger.info(String.format("FAILED ROWS: %d; UNIQUE ERRORS: %d", errorCount, uniqueErrorHashes.size()));
            workbook.close();
        }
        return true;
    }
}