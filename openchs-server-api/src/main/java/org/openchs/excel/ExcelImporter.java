package org.openchs.excel;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.openchs.healthmodule.adapter.HealthModuleInvokerFactory;
import org.openchs.importer.Importer;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;
import java.io.InputStream;
import java.text.ParseException;
import java.util.Iterator;

@Component
public class ExcelImporter implements Importer {
    private final org.slf4j.Logger logger;
    @Autowired
    private RowProcessor rowProcessor;
    @Autowired @Lazy
    private HealthModuleInvokerFactory healthModuleInvokerFactory;

    public ExcelImporter() {
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public void rowImport(Row row, SheetMetaData sheetMetaData, RowProcessor rowProcessor, HealthModuleInvokerFactory healthModuleInvokerFactory) throws ParseException {
        switch (sheetMetaData.getImportedEntity()) {
            case Individual:
                rowProcessor.processIndividual(row);
                break;
            case Enrolment:
                rowProcessor.processEnrolment(row, sheetMetaData, healthModuleInvokerFactory.getProgramEnrolmentInvoker());
                break;
            case Visit:
                rowProcessor.processProgramEncounter(row, sheetMetaData, healthModuleInvokerFactory.getProgramEncounterInvoker());
                break;
            case Checklist:
                rowProcessor.processChecklist(row, sheetMetaData);
                break;
        }
    }

    private void processHeader(SheetMetaData sheetMetaData, Row row, RowProcessor rowProcessor) {
        switch (sheetMetaData.getImportedEntity()) {
            case Individual:
                rowProcessor.readRegistrationHeader(row);
                break;
            case Enrolment:
                rowProcessor.readEnrolmentHeader(row, sheetMetaData);
                break;
            case Visit:
                rowProcessor.readProgramEncounterHeader(row, sheetMetaData);
                break;
            case Checklist:
                rowProcessor.readChecklistHeader(row, sheetMetaData);
                break;
        }
    }

    @Override
    public Boolean importData(InputStream inputStream) throws Exception {
        Boolean returnValue = true;
        XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
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
                        processHeader(sheetMetaData, row, rowProcessor);
                        continue;
                    }
                    String rawCellValue = ExcelUtil.getRawCellValue(row, 0);
                    if (rawCellValue == null || rawCellValue.isEmpty()) {
                        logger.info(String.format("Breaking at row number: %d", k));
                        break;
                    }
                    this.rowImport(row, sheetMetaData, rowProcessor, healthModuleInvokerFactory);
                }
                logger.info("COMPLETED SHEET: ", sheet.getSheetName());
            }
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