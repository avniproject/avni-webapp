package org.avni.importer.batch.csv.writer.header;

public class CommonEncounterHeaders implements Headers {
    public final String id = "Id";
    public final String encounterType = "Encounter Type";
    public final String visitDate = "Visit Date";
    public final String earliestVisitDate = "Earliest Visit Date";
    public final String maxVisitDate = "Max Visit Date";
    public final String encounterLocation = "Encounter Location";
    public final String cancelLocation = "Cancel Location";

    @Override
    public String[] getAllHeaders() {
        return new String[]{id, encounterType, visitDate, earliestVisitDate, maxVisitDate, encounterLocation, cancelLocation};
    }
}
