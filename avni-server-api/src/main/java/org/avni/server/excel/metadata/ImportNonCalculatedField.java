package org.avni.server.excel.metadata;

import org.apache.poi.ss.usermodel.Row;
import org.avni.server.application.FormType;
import org.avni.server.excel.ExcelUtil;
import org.avni.server.excel.ImportSheetHeader;

import java.util.Date;

public class ImportNonCalculatedField implements ImportField {
    private FormType formType;
    private String systemFieldName;
    private String userFileType;
    private String userField;
    private String ignoreMissingAnswers;

    public FormType getFormType() {
        return formType;
    }

    public void setFormType(FormType formType) {
        this.formType = formType;
    }

    @Override
    public String getSystemFieldName() {
        return systemFieldName;
    }

    public void setSystemFieldName(String systemFieldName) {
        this.systemFieldName = systemFieldName;
    }

    public void setUserFileType(String userFileType) {
        this.userFileType = userFileType;
    }

    public String getUserField() {
        return userField;
    }

    public String getUserFileType() {
        return userFileType;
    }

    public void setUserField(String userField) {
        this.userField = userField;
    }

    public void setIgnoreMissingAnswers(String ignoreMissingAnswers){
        this.ignoreMissingAnswers = ignoreMissingAnswers;
    }

    @Override
    public String getTextValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        int position = getPosition(importSheetHeader);
        return position == -1 ? null : ExcelUtil.getText(row, position);
    }

    @Override
    public Double getDoubleValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        int position = getPosition(importSheetHeader);
        return position == -1 ? null : ExcelUtil.getNumber(row, position);
    }

    private int getPosition(ImportSheetHeader importSheetHeader) {
        return importSheetHeader.getPosition(userField);
    }

    @Override
    public Date getDateValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        int position = getPosition(importSheetHeader);
        return position == -1 ? null : ExcelUtil.getDate(row, position);
    }

    public Boolean doIgnoreMissingAnswers() {
        return "true".equalsIgnoreCase(this.ignoreMissingAnswers);
    }

    @Override
    public Boolean getBooleanValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        int position = getPosition(importSheetHeader);
        if (position == -1) {
            return false;
        }
        Boolean aBoolean = ExcelUtil.getBoolean(row, position);
        if (aBoolean == null) return false;
        return aBoolean;
    }

    @Override
    public String toString() {
        return "{" +
                ", formType=" + formType +
                ", systemFieldName='" + systemFieldName + '\'' +
                ", userFileType='" + userFileType + '\'' +
                ", ignoreMissingAnswers='" + ignoreMissingAnswers + '\'' +
                '}';
    }
}
