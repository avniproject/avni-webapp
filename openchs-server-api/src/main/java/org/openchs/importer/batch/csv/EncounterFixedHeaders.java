package org.openchs.importer.batch.csv;

public class EncounterFixedHeaders extends CommonEncounterFixedHeaders implements Headers {
    public static final String subjectId = "Subject Id";

    @Override
    public String[] getAllHeaders() {
        return new String[]{id, encounterType, subjectId, visitDate, earliestVisitDate, maxVisitDate, encounterLocation, cancelLocation};
    }
}
