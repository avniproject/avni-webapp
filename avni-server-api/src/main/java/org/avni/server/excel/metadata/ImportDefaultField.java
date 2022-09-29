package org.avni.server.excel.metadata;

import org.apache.poi.ss.usermodel.Row;
import org.avni.server.excel.ImportSheetHeader;
import org.avni.server.excel.TextToType;

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

    public Boolean doIgnoreMissingAnswers() {
        return false;
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
    public Double getDoubleValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        return (Double) defaultValue;
    }

    @Override
    public Boolean getBooleanValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        if (defaultValue instanceof Boolean) return (Boolean) defaultValue;
        else if (defaultValue instanceof String) return TextToType.toBoolean((String) defaultValue);
        throw new RuntimeException(String.format("%s cannot be converted into boolean", defaultValue));
    }

    @Override
    public String toString() {
        return "{" +
                "systemFieldName='" + systemFieldName + '\'' +
                ", defaultValue=" + defaultValue +
                '}';
    }
}
