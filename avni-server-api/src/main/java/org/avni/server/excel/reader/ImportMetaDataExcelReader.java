package org.avni.server.excel.reader;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.avni.server.application.FormType;
import org.avni.server.excel.ExcelUtil;
import org.avni.server.excel.metadata.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;

public class ImportMetaDataExcelReader {
    private static Logger logger = LoggerFactory.getLogger(ImportMetaDataExcelReader.class);

    public static ImportMetaData readMetaData(InputStream inputStream) throws IOException {
        XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
        ImportMetaData importMetaData = new ImportMetaData();
        ImportMetaDataExcelReader importMetaDataExcelReader = new ImportMetaDataExcelReader();
        importMetaData.setImportSheets(importMetaDataExcelReader.readSheets(workbook));

        importMetaData.setNonCalculatedFields(importMetaDataExcelReader.readFields(workbook, importMetaData.getImportSheets()));
        importMetaData.setCalculatedFields(importMetaDataExcelReader.readCalculatedFields(workbook, importMetaData.getImportSheets()));
        importMetaData.setAnswerMetaDataList(importMetaDataExcelReader.readAnswerMetaDataList(workbook));
        return importMetaData;
    }

    private ImportAnswerMetaDataList readAnswerMetaDataList(XSSFWorkbook workbook) {
        ImportAnswerMetaDataList list = new ImportAnswerMetaDataList();
        XSSFSheet sheet = workbook.getSheet("Answer Fields");
        if (sheet == null) return list;
        Iterator<Row> iterator = sheet.iterator();
        int k = 0;
        while (iterator.hasNext()) {
            Row row = iterator.next();
            if (k != 0 && !ExcelUtil.isFirstCellEmpty(row)) {
                ImportAnswerMetaData importAnswerMetaData = new ImportAnswerMetaData();
                importAnswerMetaData.setSystemAnswer(ExcelUtil.getText(row, 0));
                importAnswerMetaData.setUserAnswer(ExcelUtil.getText(row, 1));
                importAnswerMetaData.setConceptName(ExcelUtil.getText(row, 2));
                list.add(importAnswerMetaData);
            }
            k++;
        }
        return list;
    }

    private ImportSheetMetaDataList readSheets(XSSFWorkbook workbook) {
        ImportSheetMetaDataList importSheets = new ImportSheetMetaDataList();
        XSSFSheet sheet = workbook.getSheet("Sheets");
        Iterator<Row> iterator = sheet.iterator();
        int k = 0;
        while (iterator.hasNext()) {
            Row row = iterator.next();
            if (k == 0) {
                for (int i = 7; i < row.getLastCellNum(); i++) {
                    String systemFieldName = ExcelUtil.getText(row, i);
                    if (StringUtils.isEmpty(systemFieldName)) break;
                    importSheets.addSystemField(i - 7, systemFieldName);
                }
                logger.info("Read header of Sheets");
            } else if (!ExcelUtil.isFirstCellEmpty(row)) {
                ImportSheetMetaData importSheetMetaData = new ImportSheetMetaData();
                importSheetMetaData.setRowNo(k+1);
                importSheetMetaData.setFileName(ExcelUtil.getText(row, 0));
                importSheetMetaData.setUserFileType(ExcelUtil.getText(row, 1));
                importSheetMetaData.setSheetName(ExcelUtil.getText(row, 2));
                importSheetMetaData.setEntityType(ExcelUtil.getText(row, 3));
                importSheetMetaData.setProgramName(ExcelUtil.getText(row, 4));
                importSheetMetaData.setEncounterType(ExcelUtil.getText(row, 5));
                importSheetMetaData.setActive("Yes".equals(ExcelUtil.getText(row, 6)));
                importSheetMetaData.setAddressLevel(ExcelUtil.getText(row, 7));
                for (int i = 0; i < importSheets.getNumberOfSystemFields(); i++) {
                    Object defaultValue = ExcelUtil.getValueOfBestType(row, i + 7);
                    if (defaultValue == null) continue;
                    importSheets.addDefaultValue(i, defaultValue, importSheetMetaData);
                }
                importSheets.add(importSheetMetaData);
                logger.info(String.format("Read row number %d of Sheets", k));
            }
            k++;
        }
        return importSheets;
    }

    private ImportCalculatedFields readCalculatedFields(XSSFWorkbook workbook, ImportSheetMetaDataList importSheetMetaDataList) {
        ImportCalculatedFields calculatedFields = new ImportCalculatedFields();
        XSSFSheet sheet = workbook.getSheet("Calculated Fields");
        Iterator<Row> iterator = sheet.iterator();
        int k = 0;
        while (iterator.hasNext()) {
            Row row = iterator.next();
            if (k != 0 && !ExcelUtil.isFirstCellEmpty(row)) {
                ImportCalculatedField calculatedField = new ImportCalculatedField();
                String userFileType = ExcelUtil.getText(row, 0);
                calculatedField.setUserFileType(userFileType);
                calculatedField.setEntityType(ExcelUtil.getText(row, 1));
                calculatedField.setSystemField(ExcelUtil.getText(row, 2));
                calculatedField.setSourceUserField(ExcelUtil.getText(row, 3));
                calculatedField.setRegex(ExcelUtil.getText(row, 4));
                calculatedField.setSeparator(ExcelUtil.getText(row, 5));
                calculatedFields.add(calculatedField);
                logger.info(String.format("Read row number %d of Calculated Fields", k));
            }
            k++;
        }
        return calculatedFields;
    }

    private ImportNonCalculatedFields readFields(XSSFWorkbook workbook, ImportSheetMetaDataList importSheetMetaDataList) {
        ImportNonCalculatedFields nonCalculatedFields = new ImportNonCalculatedFields();
        XSSFSheet sheet = workbook.getSheet("Fields");
        Iterator<Row> iterator = sheet.iterator();
        int rowNumber = 0;
        while (iterator.hasNext()) {
            Row row = iterator.next();
            rowNumber++;
            if (rowNumber == 1) continue;
            String userFileType = ExcelUtil.getText(row, 0);
            if (StringUtils.isEmpty(userFileType)) continue;

            ImportNonCalculatedField nonCalculatedField = new ImportNonCalculatedField();
            nonCalculatedField.setUserFileType(userFileType);
            nonCalculatedField.setFormType(FormType.valueOf(ExcelUtil.getText(row, 1)));
            nonCalculatedField.setSystemFieldName(ExcelUtil.getText(row, 2));
            nonCalculatedField.setUserField(ExcelUtil.getText(row, 3));
            nonCalculatedField.setIgnoreMissingAnswers(ExcelUtil.getText(row, 4));
            nonCalculatedFields.add(nonCalculatedField);
            logger.info(String.format("Read row number %d of Fields", rowNumber - 1));
        }

        return nonCalculatedFields;
    }
}
