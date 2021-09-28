package org.avni.importer.batch.csv.writer.header;

public class LocationHeaders implements Headers {
    public final String gpsCoordinates = "GPS coordinates";

    @Override
    public String[] getAllHeaders() {
        return new String[]{gpsCoordinates};
    }
}
