package org.openchs.excel;

import org.apache.poi.xssf.usermodel.XSSFRow;

public class SheetMetaData {
    private ImportedEntity importedEntity;
    private String programName;
    private String visitType;

    public SheetMetaData(XSSFRow row) {
        this.importedEntity = ImportedEntity.valueOf(ExcelUtil.getText(row, 0));
        switch (importedEntity) {
            case Individual:
                break;
            case Enrolment:
                this.programName = ExcelUtil.getText(row, 1);
                break;
            case Visit:
                this.visitType = ExcelUtil.getText(row, 1);
                this.programName = ExcelUtil.getText(row, 2);
                break;
            case Checklist:
                break;
        }
    }

    public ImportedEntity getImportedEntity() {
        return importedEntity;
    }

    public void setImportedEntity(ImportedEntity importedEntity) {
        this.importedEntity = importedEntity;
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

        if (importedEntity != that.importedEntity) return false;
        if (programName != null ? !programName.equals(that.programName) : that.programName != null) return false;
        return visitType != null ? visitType.equals(that.visitType) : that.visitType == null;
    }

    @Override
    public int hashCode() {
        int result = importedEntity.hashCode();
        result = 31 * result + (programName != null ? programName.hashCode() : 0);
        result = 31 * result + (visitType != null ? visitType.hashCode() : 0);
        return result;
    }
}