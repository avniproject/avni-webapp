package org.openchs.excel;

import org.apache.poi.xssf.usermodel.XSSFRow;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class SheetMetaData {
    private List<ImportedEntity> importedEntities;
    private String programName;
    private String visitType;
    private String fileName;

    public SheetMetaData(XSSFRow row) {
        String fileName = ExcelUtil.getText(row, 0);
        this.fileName = fileName;
        String importedEntitiesString = ExcelUtil.getText(row, 1);
        this.importedEntities = Arrays.stream(importedEntitiesString.split(",")).map(ImportedEntity::valueOf).collect(Collectors.toList());
        this.programName = ExcelUtil.getText(row, 2);
        this.visitType = ExcelUtil.getText(row, 3);
    }

    public List<ImportedEntity> getImportedEntities() {
        return importedEntities;
    }

    public String getProgramName() {
        return programName;
    }

    public void setProgramName(String programName) {
        this.programName = programName;
    }

    public String getVisitType() {
        return visitType;
    }

    public void setVisitType(String visitType) {
        this.visitType = visitType;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        SheetMetaData that = (SheetMetaData) o;

        if (importedEntities != that.importedEntities) return false;
        if (programName != null ? !programName.equals(that.programName) : that.programName != null) return false;
        return visitType != null ? visitType.equals(that.visitType) : that.visitType == null;
    }

    @Override
    public int hashCode() {
        int result = importedEntities.hashCode();
        result = 31 * result + (programName != null ? programName.hashCode() : 0);
        result = 31 * result + (visitType != null ? visitType.hashCode() : 0);
        return result;
    }

    public String getFileName() {
        return null;
    }
}