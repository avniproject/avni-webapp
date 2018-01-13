package org.openchs.excel.metadata;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.LocalDate;
import org.openchs.excel.ExcelUtil;
import org.openchs.excel.ImportSheetHeader;
import org.openchs.excel.TextToType;

import java.util.Date;

public class ImportDefaultField implements ImportField {
    private String systemFieldName;
    private String defaultValue;

    public ImportDefaultField(String systemFieldName, String defaultValue) {
        this.systemFieldName = systemFieldName;
        this.defaultValue = defaultValue;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public String getSystemFieldName() {
        return systemFieldName;
    }

    @Override
    public String getTextValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        return defaultValue;
    }

    @Override
    public Date getDateValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        return ExcelUtil.getDateFromString(defaultValue);
    }

    @Override
    public Boolean getBooleanValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        return TextToType.toBoolean(defaultValue);
    }
}