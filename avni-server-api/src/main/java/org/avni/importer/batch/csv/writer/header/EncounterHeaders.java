package org.avni.importer.batch.csv.writer.header;

public class EncounterHeaders extends CommonEncounterHeaders implements Headers {
    public final String subjectId = "Subject Id";

    @Override
    public String[] getAllHeaders() {
        return new String[]{id, encounterType, subjectId, visitDate, earliestVisitDate, maxVisitDate, encounterLocation, cancelLocation};
    }
}
