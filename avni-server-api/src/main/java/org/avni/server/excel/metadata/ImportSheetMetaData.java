package org.avni.server.excel.metadata;

import org.avni.server.application.FormType;
import org.avni.server.util.Mappings;

import java.util.*;

public class ImportSheetMetaData {
    private String fileName;
    private String userFileType;
    private String sheetName;
    private Class entityType;
    private String programName;
    private String encounterType;
    private String addressLevel;
    private boolean isActive;
    private Integer rowNo;

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

    public Boolean isNull() {
        return this.getSheetName() == null ||
                this.getEntityType() == null ||
                this.getFileName() == null ||
                this.getUserFileType() == null;
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

    public Map<String, String> asMap() {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("Row No", this.rowNo.toString());
        map.put("Sheet Name", this.getSheetName());
        map.put("User File Type", this.getUserFileType());
        map.put("Entity Type", this.getEntityType().getCanonicalName());
        map.put("User Type", this.getEntityType().getSimpleName());
        map.put("File Name", this.getFileName());
        map.put("Program Name", this.getProgramName());
        map.put("Encounter Type", this.getEncounterType());
        map.put("Address Level", this.getAddressLevel());
        map.put("Is Active", String.valueOf(isActive));
        return map;
    }

    @Override
    public String toString() {
        StringBuilder stringBuilder = new StringBuilder("ImportSheetMetaData{");
        asMap().forEach((k, v) -> stringBuilder.append(String.format("%s='%s', ", k, v)));
        stringBuilder.append("}");
        return stringBuilder.toString();
    }

    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }

    public boolean isActive() {
        return isActive;
    }

    public Integer getRowNo() {
        return rowNo;
    }

    public void setRowNo(Integer rowNo) {
        this.rowNo = rowNo;
    }
}
