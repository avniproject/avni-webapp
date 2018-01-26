package org.openchs.excel.metadata;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.LocalDate;
import org.openchs.excel.ExcelUtil;
import org.openchs.excel.ImportSheetHeader;
import org.openchs.excel.TextToType;

import java.util.Date;

public class ImportDefaultField implements ImportField {
    private String systemFieldName;
    private Object defaultValue;

    public ImportDefaultField(String systemFieldName, Object defaultValue) {
        this.systemFieldName = systemFieldName;
        this.defaultValue = defaultValue;
    }

    public Object getDefaultValue() {
        return defaultValue;
    }

    public String getSystemFieldName() {
        return systemFieldName;
    }

    @Override
    public String getTextValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        if (defaultValue instanceof Double) {
            return String.valueOf(((Double) defaultValue).intValue());
        }
        return (String) defaultValue;
    }

    @Override
    public Date getDateValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        return (Date) defaultValue;
    }

    @Override
    public Boolean getBooleanValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        if (defaultValue instanceof Boolean) return (Boolean) defaultValue;
        else if (defaultValue instanceof String) return TextToType.toBoolean((String) defaultValue);
        throw new RuntimeException(String.format("%s cannot be converted into boolean", defaultValue));
    }
}