package org.avni.server.importer.batch.csv.creator;

import org.avni.server.importer.batch.model.Row;
import org.joda.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class DateCreator {

    private static Logger logger = LoggerFactory.getLogger(DateCreator.class);

    public LocalDate getDate(Row row, String header, List<String> errorMsgs, String errorMessageIfNotExists) {
        try {
            String date = row.get(header);
            if (date != null && !date.trim().isEmpty()) {
                return LocalDate.parse(date);
            }

            if (errorMessageIfNotExists != null) {
                errorMsgs.add(errorMessageIfNotExists);
            }
            return null;
        } catch (Exception ex) {
            logger.error(String.format("Error processing row %s", row), ex);
            errorMsgs.add(String.format("Invalid '%s'", header));
            return null;
        }
    }
}
