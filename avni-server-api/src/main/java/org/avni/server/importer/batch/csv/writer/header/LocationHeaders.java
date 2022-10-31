package org.avni.server.importer.batch.csv.writer.header;

public class LocationHeaders implements Headers {
    public final static String gpsCoordinates = "GPS coordinates";

    @Override
    public String[] getAllHeaders() {
        return new String[]{gpsCoordinates};
    }
}
