package org.avni.server.importer.batch.csv.writer.header;

import org.avni.server.domain.EncounterType;

public class CommonEncounterHeaders implements Headers {
    public final static String id = "Id";
    public final static String encounterTypeHeaderName = "Encounter Type";
    public final static String visitDate = "Visit Date";
    public final static String earliestVisitDate = "Earliest Visit Date";
    public final static String maxVisitDate = "Max Visit Date";
    public final static String encounterLocation = "Encounter Location";
    public final static String cancelLocation = "Cancel Location";
    private final EncounterType encounterType;

    public CommonEncounterHeaders(EncounterType encounterType) {
        this.encounterType = encounterType;
    }

    @Override
    public String[] getAllHeaders() {
        return new String[]{id, encounterTypeHeaderName, visitDate, earliestVisitDate, maxVisitDate, encounterLocation, cancelLocation};
    }
}
