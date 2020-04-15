package org.openchs.importer.batch.csv;

public class CommonEncounterFixedHeaders implements Headers{
    public static final String id = "Id";
    public static final String encounterType = "Encounter Type";
    public static final String visitDate = "Visit Date";
    public static final String earliestVisitDate = "Earliest Visit Date";
    public static final String maxVisitDate = "Max Visit Date";
    public static final String encounterLocation = "Encounter Location";
    public static final String cancelLocation = "Cancel Location";

    @Override
    public String[] getAllHeaders() {
        return new String[]{id, encounterType, visitDate, earliestVisitDate, maxVisitDate, encounterLocation, cancelLocation};
    }
}
