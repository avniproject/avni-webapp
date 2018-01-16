package org.openchs.excel.metadata;

import org.openchs.application.FormType;
import org.openchs.util.Mappings;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class ImportSheetMetaData {
    private String fileName;
    private String userFileType;
    private String sheetName;
    private Class entityType;
    private String programName;
    private String encounterType;
    private String addressLevel;

    public ImportSheetMetaData() {
    }

    public ImportSheetMetaData(String fileName, String sheetName, Class entityType) {
        this.fileName = fileName;
        this.sheetName = sheetName;
        this.entityType = entityType;
    }

    private List<ImportDefaultField> sheetDefaults = new ArrayList<>();

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getUserFileType() {
        return userFileType;
    }

    public void setUserFileType(String userFileType) {
        this.userFileType = userFileType;
    }

    public String getSheetName() {
        return sheetName;
    }

    public void setSheetName(String sheetName) {
        this.sheetName = sheetName;
    }

    public Class getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = Mappings.ENTITY_TYPES.get(entityType);
    }

    public String getProgramName() {
        return programName;
    }

    public void setProgramName(String programName) {
        this.programName = programName;
    }

    public String getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(String encounterType) {
        this.encounterType = encounterType;
    }

    public String getAddressLevel() {
        return addressLevel;
    }

    public void setAddressLevel(String addressLevel) {
        this.addressLevel = addressLevel;
    }

    public void addDefaultValue(String systemFieldName, Object defaultValue) {
        ImportDefaultField defaultField = new ImportDefaultField(systemFieldName, defaultValue);
        sheetDefaults.add(defaultField);
    }

    public FormType getFormType() {
        return Mappings.ENTITY_TYPE_FORM_TYPE_MAP.get(this.getEntityType());
    }

    public List<ImportField> getDefaultFields() {
        ArrayList<ImportField> list = new ArrayList<>();
        list.addAll(sheetDefaults);
        return list;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ImportSheetMetaData that = (ImportSheetMetaData) o;
        return Objects.equals(fileName, that.fileName) &&
                Objects.equals(sheetName, that.sheetName) &&
                Objects.equals(entityType, that.entityType);
    }

    @Override
    public int hashCode() {

        return Objects.hash(fileName, sheetName, entityType);
    }
}