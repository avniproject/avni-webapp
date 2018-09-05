package org.openchs.excel.metadata;

import org.apache.poi.ss.usermodel.Row;
import org.openchs.application.FormType;
import org.openchs.excel.ExcelUtil;
import org.openchs.excel.ImportSheetHeader;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class ImportNonCalculatedField implements ImportField {
    private FormType formType;
    private Boolean isCore;
    private String systemFieldName;
    private String userFileType;

    private Map<String, String> userFileTypeFieldNameMap = new HashMap<>();

    public FormType getFormType() {
        return formType;
    }

    public void setFormType(FormType formType) {
        this.formType = formType;
    }

    public boolean isCore() {
        return isCore;
    }

    public void setCore(Boolean core) {
        isCore = core;
    }

    @Override
    public String getSystemFieldName() {
        return systemFieldName;
    }

    public void setSystemFieldName(String systemFieldName) {
        this.systemFieldName = systemFieldName;
    }

    public String getUserFileType() {
        return userFileType;
    }

    public void setUserFileType(String userFileType) {
        this.userFileType = userFileType;
    }

    public void addUserField(String userFieldName, String userFileType) {
        userFileTypeFieldNameMap.put(userFileType, userFieldName);
    }

    public String getUserField(String userFileType) {
        return userFileTypeFieldNameMap.get(userFileType);
    }

    @Override
    public String getTextValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        int position = getPosition(importSheetHeader, importSheetMetaData);
        return position == -1 ? null : ExcelUtil.getText(row, position);
    }

    @Override
    public Double getDoubleValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        int position = getPosition(importSheetHeader, importSheetMetaData);
        return position == -1 ? null : ExcelUtil.getNumber(row, position);
    }

    private int getPosition(ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        String userFieldName = userFileTypeFieldNameMap.get(importSheetMetaData.getUserFileType());
        return importSheetHeader.getPosition(userFieldName);
    }

    @Override
    public Date getDateValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        int position = getPosition(importSheetHeader, importSheetMetaData);
        return position == -1 ? null : ExcelUtil.getDate(row, position);
    }

    @Override
    public Boolean getBooleanValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        int position = getPosition(importSheetHeader, importSheetMetaData);
        if (position == -1) {
            return false;
        }
        Boolean aBoolean = ExcelUtil.getBoolean(row, position);
        if (aBoolean == null) return false;
        return aBoolean;
    }

    public int userFileCount() {
        return this.userFileTypeFieldNameMap.size();
    }

    @Override
    public String toString() {
        return "{" +
                ", formType=" + formType +
                ", isCore=" + isCore +
                ", systemFieldName='" + systemFieldName + '\'' +
                ", userFileType='" + userFileType + '\'' +
                '}';
    }
}