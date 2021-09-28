package org.avni.importer.batch.csv.writer.header;

public class ProgramEncounterHeaders extends CommonEncounterHeaders implements Headers {
    public final String enrolmentId = "Enrolment Id";

    @Override
    public String[] getAllHeaders() {
        return new String[]{id, encounterType, enrolmentId, visitDate, earliestVisitDate, maxVisitDate, encounterLocation, cancelLocation};
    }
}
