package org.avni.exporter.v2;

import org.avni.exporter.LongitudinalExportTasklet;
import org.avni.service.ExportS3Service;
import org.avni.web.request.export.ExportOutput;
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

public class LongitudinalExportV2TaskletImpl implements LongitudinalExportTasklet {

    private static final Logger logger = LoggerFactory.getLogger(LongitudinalExportV2TaskletImpl.class);
    private final int cacheClearSize;
    private final EntityManager entityManager;
    private final ExportV2CSVFieldExtractor exportV2CSVFieldExtractor;
    private final ExportV2Processor exportV2Processor;
    private final ExportS3Service exportS3Service;
    private final String jobUuid;
    private final Iterator iterator;
    private final Stream stream;
    private int read;
    private FlatFileItemWriter<ItemRow> writer;


    public LongitudinalExportV2TaskletImpl(int cacheClearSize, EntityManager entityManager, ExportV2CSVFieldExtractor exportV2CSVFieldExtractor,
                                           ExportV2Processor exportV2Processor, ExportS3Service exportS3Service, String jobUuid, Stream stream) {
        this.cacheClearSize = cacheClearSize;
        this.entityManager = entityManager;
        this.exportV2CSVFieldExtractor = exportV2CSVFieldExtractor;
        this.exportV2Processor = exportV2Processor;
        this.exportS3Service = exportS3Service;
        this.jobUuid = jobUuid;
        this.stream = stream;
        iterator = stream.iterator();
    }

    @Override
    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
        createFileWriter(jobUuid, chunkContext.getStepContext().getStepExecution().getExecutionContext());
        List<ItemRow> itemRows = new ArrayList<>();
        while (true) {
            if (!iterator.hasNext()) {
                logger.info("All records processed, writing last set to file");
                writeToFile(itemRows);
                break;
            }
            read++;
            Object individual = iterator.next();
            ItemRow itemRow = exportV2Processor.process(individual);
            itemRows.add(itemRow);

            if (cacheClearSize == read) {
                logger.info(String.format("Read %d records which is equal to cache clear size of %d. Clearing entity manager", read, cacheClearSize));
                writeToFile(itemRows);
                itemRows.clear();
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
        DelimitedLineAggregator<ItemRow> delimitedLineAggregator = new DelimitedLineAggregator<>();
        delimitedLineAggregator.setDelimiter(",");
        delimitedLineAggregator.setFieldExtractor(exportV2CSVFieldExtractor);
        writer.setLineAggregator(delimitedLineAggregator);
        writer.setHeaderCallback(exportV2CSVFieldExtractor);
        writer.open(executionContext);
        logger.info(String.format("Writing to file:%s", outputFile.getAbsolutePath()));
    }

    private void writeToFile(List<ItemRow> rows) throws Exception {
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
