package org.openchs.excel.metadata;

import org.openchs.application.FormType;

public class ImportMetaData {
    private ImportFields importFields;
    private ImportCalculatedFields importCalculatedFields;
    private ImportSheets importSheets;

    public ImportFields getImportFields() {
        return importFields;
    }

    public void setImportFields(ImportFields importFields) {
        this.importFields = importFields;
    }

    public ImportCalculatedFields getImportCalculatedFields() {
        return importCalculatedFields;
    }

    public void setImportCalculatedFields(ImportCalculatedFields importCalculatedFields) {
        this.importCalculatedFields = importCalculatedFields;
    }

    public ImportSheets getImportSheets() {
        return importSheets;
    }

    public void setImportSheets(ImportSheets importSheets) {
        this.importSheets = importSheets;
    }

    public String getSystemField(FormType formType, String userField, String fileName) {
        return null;
    }
}