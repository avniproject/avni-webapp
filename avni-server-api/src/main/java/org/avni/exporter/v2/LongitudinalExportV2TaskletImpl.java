package org.avni.exporter.v2;

import org.avni.exporter.ExportItemRow;
import org.avni.exporter.LongitudinalExportTasklet;
import org.avni.service.ExportS3Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.item.file.FlatFileItemWriter;
import org.springframework.batch.repeat.RepeatStatus;

import javax.persistence.EntityManager;
import java.util.Iterator;
import java.util.stream.Stream;

public class LongitudinalExportV2TaskletImpl implements LongitudinalExportTasklet {

    private static final Logger logger = LoggerFactory.getLogger(LongitudinalExportV2TaskletImpl.class);
    private final int cacheClearSize;
    private final EntityManager entityManager;
    private final ExportV2CSVFieldExtractor exportV2CSVFieldExtractor;
    private final ExportS3Service exportS3Service;
    private final String jobUuid;
    private final Iterator iterator;
    private final Stream stream;
    private int read;
    private FlatFileItemWriter<ExportItemRow> writer;

    public LongitudinalExportV2TaskletImpl(int cacheClearSize, EntityManager entityManager, ExportV2CSVFieldExtractor exportV2CSVFieldExtractor, ExportS3Service exportS3Service, String jobUuid, Stream stream) {
        this.cacheClearSize = cacheClearSize;
        this.entityManager = entityManager;
        this.exportV2CSVFieldExtractor = exportV2CSVFieldExtractor;
        this.exportS3Service = exportS3Service;
        this.jobUuid = jobUuid;
        this.stream = stream;
        iterator = stream.iterator();
    }

    @Override
    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
        return null;
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
