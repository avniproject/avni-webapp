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
        importMetaData.setNonCalculatedFields(importMetaDataExcelReader.readFields(workbook));
        importMetaData.setCalculatedFields(importMetaDataExcelReader.readCalculatedFields(workbook));
        importMetaData.setImportSheets(importMetaDataExcelReader.readSheets(workbook));
        return importMetaData;
    }

    public ImportSheetMetaDataList readSheets(XSSFWorkbook workbook) {
        ImportSheetMetaDataList importSheets = new ImportSheetMetaDataList();
        XSSFSheet sheet = workbook.getSheet("Sheets");
        Iterator<Row> iterator = sheet.iterator();
        int k = 0;
        while (iterator.hasNext()) {
            Row row = iterator.next();
            if (k == 0) {
                for (int i = 5; i < row.getLastCellNum(); i++) {
                    String systemFieldName = ExcelUtil.getText(row, i);
                    if (systemFieldName.isEmpty()) break;
                    importSheets.addSystemField(i - 5, systemFieldName);
                }
                logger.info("Read header of Sheets");
            } else {
                ImportSheetMetaData importSheetMetaData = new ImportSheetMetaData();
                importSheetMetaData.setFileName(ExcelUtil.getText(row, 0));
                importSheetMetaData.setUserFileType(ExcelUtil.getText(row, 1));
                importSheetMetaData.setSheetName(ExcelUtil.getText(row, 2));
                importSheetMetaData.setEntityType(ExcelUtil.getText(row, 3));
                importSheetMetaData.setProgramName(ExcelUtil.getText(row, 4));
                importSheetMetaData.setEncounterType(ExcelUtil.getText(row, 5));
                for (int i = 0; i < importSheets.getNumberOfSystemFields(); i++) {
                    String defaultValue = ExcelUtil.getText(row, i + 5);
                    if (defaultValue.isEmpty()) continue;
                    importSheets.addDefaultValue(i, defaultValue, importSheetMetaData);
                }
                importSheets.add(importSheetMetaData);
                logger.info(String.format("Read row number %d of Sheets", k));
            }
            k++;
        }
        return importSheets;
    }

    public ImportCalculatedFields readCalculatedFields(XSSFWorkbook workbook) {
        ImportCalculatedFields calculatedFields = new ImportCalculatedFields();
        XSSFSheet sheet = workbook.getSheet("Calculated Fields");
        Iterator<Row> iterator = sheet.iterator();
        int k = 0;
        while (iterator.hasNext()) {
            Row row = iterator.next();
            if (k != 0) {
                ImportCalculatedField calculatedField = new ImportCalculatedField();
                calculatedField.setUserFileType(ExcelUtil.getText(row, 0));
                calculatedField.setEntityType(ExcelUtil.getText(row, 1));
                calculatedField.setSystemField(ExcelUtil.getText(row, 2));
                calculatedField.setSourceUserField(ExcelUtil.getText(row, 3));
                calculatedField.setRegex(ExcelUtil.getText(row, 4));
                calculatedFields.add(calculatedField);
            }
            logger.info(String.format("Read row number %d of Calculated Fields", k));
            k++;
        }
        return calculatedFields;
    }

    public ImportNonCalculatedFields readFields(XSSFWorkbook workbook) {
        ImportNonCalculatedFields nonCalculatedFields = new ImportNonCalculatedFields();
        XSSFSheet sheet = workbook.getSheet("Fields");
        Iterator<Row> iterator = sheet.iterator();
        int k = 0;
        while (iterator.hasNext()) {
            Row row = iterator.next();
            if (k == 0) {
                for (int i = 4; i < row.getLastCellNum(); i++) {
                    String userFileType = ExcelUtil.getText(row, i);
                    if (userFileType.isEmpty()) break;
                    nonCalculatedFields.addFileType(i - 4, userFileType);
                }
                logger.info("Read header of Fields");
            } else {
                String formName = ExcelUtil.getText(row, 0);
                if (formName.isEmpty()) break;

                ImportNonCalculatedField nonCalculatedField = new ImportNonCalculatedField();
                nonCalculatedField.setFormName(formName);
                nonCalculatedField.setFormType(FormType.valueOf(ExcelUtil.getText(row, 1)));
                nonCalculatedField.setCore(ExcelUtil.getBoolean(row, 2));
                nonCalculatedField.setSystemFieldName(ExcelUtil.getText(row, 3));
                for (int i = 0; i < nonCalculatedFields.getNumberOfFileTypes(); i++) {
                    String userFieldName = ExcelUtil.getText(row, i + 4);
                    if (userFieldName.isEmpty()) continue;
                    nonCalculatedFields.addUserField(i, userFieldName, nonCalculatedField);
                }
                nonCalculatedFields.add(nonCalculatedField);
                logger.info(String.format("Read row number %d of Fields", k));
            }
            k++;
        }
        return nonCalculatedFields;
    }
}