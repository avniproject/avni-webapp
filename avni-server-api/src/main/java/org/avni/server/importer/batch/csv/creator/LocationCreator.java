package org.avni.server.importer.batch.csv.creator;

import org.avni.server.geo.Point;
import org.avni.server.importer.batch.model.Row;
import org.avni.server.util.S;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class LocationCreator {

    private static Logger logger = LoggerFactory.getLogger(LocationCreator.class);

    public Point getLocation(Row row, String header, List<String> errorMsgs) {
        try {
            String location = row.get(header);
            if (!S.isEmpty(location)) {
                String[] points = location.split(",");
                return new Point(Double.parseDouble(points[0].trim()), Double.parseDouble(points[1].trim()));
            }
        } catch (Exception ex) {
            logger.error(String.format("Error processing row %s", row), ex);
            errorMsgs.add(String.format("Invalid '%s'", header));
            return null;
        }
        return null;
    }
}
