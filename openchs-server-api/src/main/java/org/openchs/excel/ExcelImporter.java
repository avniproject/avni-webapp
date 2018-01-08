package org.openchs.excel;

import org.apache.logging.log4j.util.Strings;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.openchs.healthmodule.adapter.HealthModuleInvokerFactory;
import org.openchs.importer.Importer;
import org.openchs.util.ExceptionUtil;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

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
    public boolean rowImport(Row row, SheetMetaData sheetMetaData, RowProcessor rowProcessor, HealthModuleInvokerFactory healthModuleInvokerFactory, ExcelFileHeaders excelFileHeaders, Set<Integer> errors, MetaDataMapping metaDataMapping) {
        try {
            for (ImportedEntity importedEntity : sheetMetaData.getImportedEntities()) {
                switch (importedEntity) {
                    case Individual:
                        rowProcessor.processIndividual(row, excelFileHeaders, metaDataMapping, sheetMetaData);
                        break;
                    case Enrolment:
                        rowProcessor.processEnrolment(row, sheetMetaData, healthModuleInvokerFactory.getProgramEnrolmentInvoker(), excelFileHeaders, metaDataMapping);
                        break;
                    case Visit:
                        rowProcessor.processProgramEncounter(row, sheetMetaData, healthModuleInvokerFactory.getProgramEncounterInvoker(), excelFileHeaders, metaDataMapping);
                        break;
                    case Checklist:
                        rowProcessor.processChecklist(row, sheetMetaData, excelFileHeaders);
                        break;
                }
            }
            return true;
        } catch (Exception e) {
            errors.add(ExceptionUtil.getExceptionHash(e));
            this.logger.error("Row import failed", e);
            return false;
        }
    }

    private void processHeader(SheetMetaData sheetMetaData, Row row, RowProcessor rowProcessor, ExcelFileHeaders excelFileHeaders) {
        for (ImportedEntity importedEntity : sheetMetaData.getImportedEntities()) {
            switch (importedEntity) {
                case Individual:
                    rowProcessor.readRegistrationHeader(row, excelFileHeaders);
                    break;
                case Enrolment:
                    rowProcessor.readEnrolmentHeader(row, sheetMetaData, excelFileHeaders);
                    break;
                case Visit:
                    rowProcessor.readProgramEncounterHeader(row, sheetMetaData, excelFileHeaders);
                    break;
                case Checklist:
                    rowProcessor.readChecklistHeader(row, sheetMetaData, excelFileHeaders);
                    break;
            }
        }
    }

    public MetaDataMapping importMetaData(InputStream inputStream) throws IOException {
        MetaDataMapping metaDataMapping = new MetaDataMapping();
        XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
        XSSFSheet sheet = workbook.getSheetAt(0);
        Iterator<Row> iterator = sheet.iterator();
        int k = 0;
        while (iterator.hasNext()) {
            Row row = iterator.next();
            if (k == 0) {
                rowProcessor.readMetaDataHeader(row, metaDataMapping.getMappingHeader());
            } else {
                rowProcessor.readMetaData(row, metaDataMapping);
            }
            k++;
        }
        return metaDataMapping;
    }

    @Override
    public Boolean importData(InputStream inputStream, MetaDataMapping metaDataMapping) throws Exception {
        ExcelFileHeaders excelFileHeaders = new ExcelFileHeaders();
        Boolean returnValue = true;
        XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
        int errorCount = 0;
        HashSet<Integer> uniqueErrorHashes = new HashSet<>();
        try {
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                XSSFSheet sheet = workbook.getSheetAt(i);
                logger.info(String.format("READING SHEET: %s", sheet.getSheetName()));
                XSSFRow firstRow = sheet.getRow(0);
                SheetMetaData sheetMetaData = new SheetMetaData(firstRow);
                Iterator<Row> iterator = sheet.iterator();
                int k = 0;
                while (iterator.hasNext()) {
                    k++;
                    Row row = iterator.next();
                    if (k == 1) {
                        continue;
                    }
                    if (k == 2) {
                        processHeader(sheetMetaData, row, rowProcessor, excelFileHeaders);
                        continue;
                    }
                    String rawCellValue = ExcelUtil.getRawCellValue(row, 0);
                    if (Strings.isBlank(rawCellValue)) {
                        logger.info(String.format("Breaking at row number: %d", k));
                        break;
                    }
                    if (!this.rowImport(row, sheetMetaData, rowProcessor, healthModuleInvokerFactory, excelFileHeaders, uniqueErrorHashes, metaDataMapping)) errorCount++;
                }
                logger.info(String.format("COMPLETED SHEET: %s", sheet.getSheetName()));
            }
            logger.info(String.format("FAILED ROWS: %d; UNIQUE ERRORS: %d", errorCount, uniqueErrorHashes.size()));
        } catch (Exception error) {
            logger.error(error.getMessage(), error);
            throw error;
        } finally {
            workbook.close();
            inputStream.close();
        }
        return returnValue;
    }
}