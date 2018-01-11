package org.openchs.excel.reader;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.openchs.application.FormType;
import org.openchs.excel.ExcelUtil;
import org.openchs.excel.metadata.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;

public class ImportMetaDataExcelReader {
    private static Logger logger = LoggerFactory.getLogger(ImportMetaDataExcelReader.class);

    public static ImportMetaData readMetaData(InputStream inputStream) throws IOException {
        XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
        ImportMetaData importMetaData = new ImportMetaData();
        ImportMetaDataExcelReader importMetaDataExcelReader = new ImportMetaDataExcelReader();
        importMetaData.setImportFields(importMetaDataExcelReader.readFields(workbook));
        importMetaData.setImportCalculatedFields(importMetaDataExcelReader.readCalculatedFields(workbook));
        importMetaData.setImportSheets(importMetaDataExcelReader.readSheets(workbook));
        return importMetaData;
    }

    public ImportSheets readSheets(XSSFWorkbook workbook) {
        ImportSheets importSheets = new ImportSheets();
        XSSFSheet sheet = workbook.getSheet("Sheets");
        Iterator<Row> iterator = sheet.iterator();
        int k = 0;
        while (iterator.hasNext()) {
            Row row = iterator.next();
            if (k == 0) {
                for (int i = 5; i < row.getLastCellNum(); i++) {
                    String systemFieldName = ExcelUtil.getText(row, i);
                    if (systemFieldName.isEmpty()) break;
                    importSheets.addSystemField(i - 4, systemFieldName);
                }
                logger.info("Read header of Sheets");
            } else {
                ImportSheet importSheet = new ImportSheet();
                importSheet.setFileName(ExcelUtil.getText(row, 0));
                importSheet.setUserFileType(ExcelUtil.getText(row, 1));
                importSheet.setSheetName(ExcelUtil.getText(row, 2));
                importSheet.setEntityType(ExcelUtil.getText(row, 3));
                importSheet.setProgramName(ExcelUtil.getText(row, 4));
                importSheet.setEncounterType(ExcelUtil.getText(row, 5));
                for (int i = 5; i < row.getLastCellNum(); i++) {
                    String defaultValue = ExcelUtil.getText(row, i);
                    if (defaultValue.isEmpty()) break;
                    importSheet.addDefaultValue(i - 5, defaultValue);
                }
                importSheets.add(importSheet);
                logger.info(String.format("Read row number %d of Sheets", k));
            }
            k++;
        }
        return importSheets;
    }

    public ImportCalculatedFields readCalculatedFields(XSSFWorkbook workbook) {
        ImportCalculatedFields importCalculatedFields = new ImportCalculatedFields();
        XSSFSheet sheet = workbook.getSheet("Calculated Fields");
        Iterator<Row> iterator = sheet.iterator();
        int k = 0;
        while (iterator.hasNext()) {
            Row row = iterator.next();
            if (k != 0) {
                ImportCalculatedField importCalculatedField = new ImportCalculatedField();
                importCalculatedField.setUniqueKey(ExcelUtil.getText(row, 0));
                importCalculatedField.setFormName(ExcelUtil.getText(row, 1));
                importCalculatedField.setSystemField(ExcelUtil.getText(row, 2));
                importCalculatedField.setRegex(ExcelUtil.getText(row, 3));
                importCalculatedFields.add(importCalculatedField);
            }
            logger.info(String.format("Read row number %d of Calculated Fields", k));
            k++;
        }
        return importCalculatedFields;
    }

    public ImportFields readFields(XSSFWorkbook workbook) {
        ImportFields importFields = new ImportFields();
        XSSFSheet sheet = workbook.getSheet("Fields");
        Iterator<Row> iterator = sheet.iterator();
        int k = 0;
        while (iterator.hasNext()) {
            Row row = iterator.next();
            if (k == 0) {
                for (int i = 4; i < row.getLastCellNum(); i++) {
                    String userFileType = ExcelUtil.getText(row, i);
                    if (userFileType.isEmpty()) break;
                    importFields.addFileType(i - 4, userFileType);
                }
                logger.info("Read header of Fields");
            } else {
                String formName = ExcelUtil.getText(row, 0);
                if (formName.isEmpty()) break;

                ImportField importField = new ImportField();
                importField.setFormName(formName);
                importField.setFormType(FormType.valueOf(ExcelUtil.getText(row, 1)));
                importField.setCore(ExcelUtil.getBoolean(row, 2));
                importField.setSystemField(ExcelUtil.getText(row, 3));
                for (int i = 4; i < row.getLastCellNum(); i++) {
                    String mappedFieldName = ExcelUtil.getText(row, i);
                    if (mappedFieldName.isEmpty()) break;
                    importFields.addFileType(i - 4, mappedFieldName);
                }
                importFields.add(importField);
                logger.info(String.format("Read row number %d of Fields", k));
            }
            k++;
        }
        return importFields;
    }
}