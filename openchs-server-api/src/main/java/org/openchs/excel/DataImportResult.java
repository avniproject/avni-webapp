package org.openchs.excel;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

public class DataImportResult {
    private Set<DataImportError> uniqueErrors = new HashSet<>();
    private List<DataImportError> allErrors = new ArrayList<>();

    private static Logger logger = LoggerFactory.getLogger(DataImportResult.class);

    public DataImportError exceptionHappened(Map<String, String> info, Exception exception) {
        DataImportError error = new DataImportError(exception, info);
        uniqueErrors.add(error);
        allErrors.add(error);
        return error;
    }

    public void report() {
        logger.info(String.format("FAILED ROWS: %d; UNIQUE ERRORS: %d", allErrors.size(), uniqueErrors.size()));
        uniqueErrors.forEach(e -> {
            logger.error(e.toString());
            logger.error("Exception", e.getException());
        });
    }
}