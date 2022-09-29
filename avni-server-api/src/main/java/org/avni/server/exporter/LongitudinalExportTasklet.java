package org.avni.server.exporter;

import org.springframework.batch.core.step.tasklet.Tasklet;

public interface LongitudinalExportTasklet extends Tasklet, ItemReaderCleaner {
}
