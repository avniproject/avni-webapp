package org.openchs.excel.metadata;

import org.openchs.domain.Encounter;
import org.openchs.domain.Individual;
import org.openchs.domain.ProgramEncounter;
import org.openchs.domain.ProgramEnrolment;

import java.util.HashMap;
import java.util.Map;

public class ImportSheet {
    private String fileName;
    private String userFileType;
    private String sheetName;
    private Class entityType;
    private String programName;
    private String encounterType;

    private static Map<String, Class> entityTypes = new HashMap<>();

    static {
        entityTypes.put(Individual.class.getName(), Individual.class);
        entityTypes.put(Encounter.class.getName(), Encounter.class);
        entityTypes.put(ProgramEnrolment.class.getName(), ProgramEnrolment.class);
        entityTypes.put(ProgramEncounter.class.getName(), ProgramEncounter.class);
    }

    private Map<String, Object> sheetDefaults;

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
        this.entityType = entityTypes.get(entityType);
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

    public void addDefaultValue(int position, String defaultValue) {

    }
}