package org.avni.server.exporter;

import org.avni.server.service.ExportS3Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.file.FlatFileItemWriter;
import org.springframework.batch.item.file.transform.DelimitedLineAggregator;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.core.io.FileSystemResource;

import javax.persistence.EntityManager;
import java.io.File;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Stream;

public class LongitudinalExportTaskletImpl implements LongitudinalExportTasklet {
    private final int cacheClearSize;
    private final EntityManager entityManager;
    private final ExportCSVFieldExtractor exportCSVFieldExtractor;
    private final ExportProcessor exportProcessor;
    private final ExportS3Service exportS3Service;
    private final String jobUuid;
    private int read;
    private FlatFileItemWriter<ExportItemRow> writer;
    private static final Logger logger = LoggerFactory.getLogger(LongitudinalExportTaskletImpl.class);
    private final Iterator iterator;
    private final Stream stream;

    public LongitudinalExportTaskletImpl(int cacheClearSize, EntityManager entityManager, ExportCSVFieldExtractor exportCSVFieldExtractor, ExportProcessor exportProcessor, ExportS3Service exportS3Service, String jobUuid, Stream stream) {
        this.cacheClearSize = cacheClearSize;
        this.entityManager = entityManager;
        this.exportCSVFieldExtractor = exportCSVFieldExtractor;
        this.exportProcessor = exportProcessor;
        this.exportS3Service = exportS3Service;
        this.jobUuid = jobUuid;
        this.stream = stream;
        iterator = stream.iterator();
    }

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        createFileWriter(jobUuid, chunkContext.getStepContext().getStepExecution().getExecutionContext());
        List<ExportItemRow> exportItemRows = new ArrayList<>();
        while (true) {
            if (!iterator.hasNext()) {
                logger.info("All records processed, writing last set to file");
                writeToFile(exportItemRows);
                break;
            }
            read++;
            Object individual = iterator.next();
            ExportItemRow exportItemRow = exportProcessor.process(individual);
            exportItemRows.add(exportItemRow);

            if (cacheClearSize == read) {
                logger.info(String.format("Read %d records which is equal to cache clear size of %d. Clearing entity manager", read, cacheClearSize));
                writeToFile(exportItemRows);
                exportItemRows.clear();
                entityManager.flush();
                entityManager.clear();
                read = 0;
            }
        }

        logger.info("Completed reading all records");
        return RepeatStatus.FINISHED;
    }

    private void createFileWriter(String uuid, ExecutionContext executionContext) {
        writer = new FlatFileItemWriter<>();
        File outputFile = exportS3Service.getLocalExportFile(uuid);
        writer.setResource(new FileSystemResource(outputFile));
        DelimitedLineAggregator<ExportItemRow> delimitedLineAggregator = new DelimitedLineAggregator<>();
        delimitedLineAggregator.setDelimiter(",");
        delimitedLineAggregator.setFieldExtractor(exportCSVFieldExtractor);
        writer.setLineAggregator(delimitedLineAggregator);
        writer.setHeaderCallback(exportCSVFieldExtractor);
        writer.open(executionContext);
        logger.info(String.format("Writing to file:%s", outputFile.getAbsolutePath()));
    }

    private void writeToFile(List<ExportItemRow> rows) throws Exception {
        if (rows.size() == 0) return;
        writer.write(rows);
    }

    @Override
    public void clean() {
        logger.info("Closing the result set stream");
        try {
            writer.close();
        } catch (Exception e) {
            logger.error("Error closing writer", e);
        }

        try {
            stream.close();
        } catch (Exception e) {
            logger.error("Error closing data stream", e);
        }
    }
}
