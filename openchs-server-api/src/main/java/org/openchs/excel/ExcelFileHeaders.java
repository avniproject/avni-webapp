package org.openchs.excel;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ExcelFileHeaders {
    private List<String> registrationHeader = new ArrayList<>();
    private Map<SheetMetaData, List<String>> enrolmentHeaders = new HashMap<>();
    private Map<SheetMetaData, List<String>> programEncounterHeaders = new HashMap<>();
    private Map<SheetMetaData, List<String>> checklistHeaders = new HashMap<>();

    public List<String> getRegistrationHeader() {
        return registrationHeader;
    }

    public Map<SheetMetaData, List<String>> getEnrolmentHeaders() {
        return enrolmentHeaders;
    }

    public Map<SheetMetaData, List<String>> getProgramEncounterHeaders() {
        return programEncounterHeaders;
    }

    public Map<SheetMetaData, List<String>> getChecklistHeaders() {
        return checklistHeaders;
    }
}