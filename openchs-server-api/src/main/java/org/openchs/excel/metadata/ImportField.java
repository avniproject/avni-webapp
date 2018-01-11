package org.openchs.excel.metadata;

import org.openchs.application.FormType;

public class ImportField {
    private String formName;
    private FormType formType;
    private Boolean isCore;
    private String systemField;
    private String importUserFileType;

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

    public String getSystemField() {
        return systemField;
    }

    public void setSystemField(String systemField) {
        this.systemField = systemField;
    }

    public String getImportUserFileType() {
        return importUserFileType;
    }

    public void setImportUserFileType(String importUserFileType) {
        this.importUserFileType = importUserFileType;
    }
}