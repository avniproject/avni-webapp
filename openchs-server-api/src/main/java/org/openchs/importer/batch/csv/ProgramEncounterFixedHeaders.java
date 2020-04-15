package org.openchs.importer.batch.csv;

public class ProgramEncounterFixedHeaders extends EncounterFixedHeaders implements Headers {
    public static final String enrolmentId = "Enrolment Id";

    @Override
    public String[] getAllHeaders() {
        return new String[]{id, encounterType, enrolmentId, visitDate, earliestVisitDate, maxVisitDate, encounterLocation, cancelLocation};
    }
}
