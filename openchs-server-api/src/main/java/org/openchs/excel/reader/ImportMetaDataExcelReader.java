package org.openchs.excel.reader;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.openchs.application.FormType;
import org.openchs.excel.ExcelUtil;
import org.openchs.excel.metadata.*;

import java.util.Iterator;

public class ImportMetaDataExcelReader {
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
            } else {
                ImportField importField = new ImportField();
                importField.setFormName(ExcelUtil.getText(row, 0));
                importField.setFormType(FormType.valueOf(ExcelUtil.getText(row, 1)));
                importField.setCore(ExcelUtil.getBoolean(row, 2));
                importField.setSystemField(ExcelUtil.getText(row, 3));
                for (int i = 4; i < row.getLastCellNum(); i++) {
                    String mappedFieldName = ExcelUtil.getText(row, i);
                    if (mappedFieldName.isEmpty()) break;
                    importFields.addFileType(i - 4, mappedFieldName);
                }
                importFields.add(importField);
            }
            k++;
        }
        return importFields;
    }
}