package org.avni.server.excel;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

public class DataImportResult {
    private Map<DataImportError, Integer> uniqueErrors = new ConcurrentHashMap<>();
    private Queue<DataImportError> allErrors = new ConcurrentLinkedQueue<>();

    private static Logger logger = LoggerFactory.getLogger(DataImportResult.class);

    public DataImportError exceptionHappened(Map<String, String> info, Exception exception) {
        DataImportError error = new DataImportError(exception, info);
        Integer currentErrorCount = uniqueErrors.get(error);
        uniqueErrors.put(error, (currentErrorCount == null ? 0 : currentErrorCount) + 1);
        allErrors.add(error);
        return error;
    }

    public void report() {
        logger.info(String.format("FAILED ROWS: %d; UNIQUE ERRORS: %d", allErrors.size(), uniqueErrors.size()));
        uniqueErrors.forEach((key, value) -> {
            logger.error(key.toString());
            logger.error("Error Count: " + value.toString());
            logger.error("Exception", key.getException());
        });
    }
}
