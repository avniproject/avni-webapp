package org.openchs.excel.metadata;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.LocalDate;
import org.openchs.application.FormType;
import org.openchs.excel.ExcelUtil;
import org.openchs.excel.ImportSheetHeader;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class ImportNonCalculatedField implements ImportField {
    private String formName;
    private FormType formType;
    private Boolean isCore;
    private String systemFieldName;
    private String importUserFileType;

    private Map<String, String> userFileTypeFieldNameMap = new HashMap<>();

    public String getFormName() {
        return formName;
    }

    public void setFormName(String formName) {
        this.formName = formName;
    }

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

    public String getImportUserFileType() {
        return importUserFileType;
    }

    public void setImportUserFileType(String importUserFileType) {
        this.importUserFileType = importUserFileType;
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
        return ExcelUtil.getText(row, position);
    }

    private int getPosition(ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        String userFieldName = userFileTypeFieldNameMap.get(importSheetMetaData.getUserFileType());
        return importSheetHeader.getPosition(userFieldName);
    }

    @Override
    public Date getDateValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        int position = getPosition(importSheetHeader, importSheetMetaData);
        return ExcelUtil.getDate(row, position);
    }

    @Override
    public Boolean getBooleanValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData) {
        int position = getPosition(importSheetHeader, importSheetMetaData);
        return ExcelUtil.getBoolean(row, position);
    }
}