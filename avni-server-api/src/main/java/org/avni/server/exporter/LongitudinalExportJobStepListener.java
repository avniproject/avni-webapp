package org.avni.server.exporter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.listener.StepExecutionListenerSupport;
import org.springframework.stereotype.Component;

@Component
@StepScope
public class LongitudinalExportJobStepListener extends StepExecutionListenerSupport {
    private ItemReaderCleaner itemReaderCleaner;
    private static Logger logger = LoggerFactory.getLogger(LongitudinalExportJobStepListener.class);

    public void setItemReaderCleaner(ItemReaderCleaner itemReaderCleaner) {
        this.itemReaderCleaner = itemReaderCleaner;
    }

    @Override
    public ExitStatus afterStep(StepExecution stepExecution) {
        logger.info("Step completed");
        itemReaderCleaner.clean();
        return super.afterStep(stepExecution);
    }
}
