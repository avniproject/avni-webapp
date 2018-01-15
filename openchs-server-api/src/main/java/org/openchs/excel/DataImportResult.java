package org.openchs.excel;

import org.openchs.util.ExceptionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashSet;

public class DataImportResult {
    private HashSet<Integer> uniqueErrorHashes = new HashSet<>();
    private HashSet<String> uniqueErrorMessages = new HashSet<>();
    private int errorCount;

    private static Logger logger = LoggerFactory.getLogger(DataImportResult.class);

    public void exceptionHappened(Exception error) {
        int exceptionHash = ExceptionUtil.getExceptionHash(error);
        uniqueErrorHashes.add(exceptionHash);
        uniqueErrorMessages.add(error.getMessage());
        errorCount++;
    }

    public void report() {
        logger.info(String.format("FAILED ROWS: %d; UNIQUE ERRORS: %d", errorCount, uniqueErrorHashes.size()));
        uniqueErrorMessages.forEach(s -> {
            logger.info(s);
        });
    }
}