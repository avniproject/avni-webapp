package org.openchs.importer.batch;

import org.openchs.importer.batch.model.Row;
import org.openchs.service.BulkUploadS3Service;
import org.springframework.batch.core.annotation.OnSkipInWrite;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.FileWriter;
import java.io.IOException;

import static java.lang.String.format;

@Component
@StepScope
public class ErrorFileWriterListener {

    @Value("#{jobParameters['uuid']}")
    private String uuid;

    private final BulkUploadS3Service bulkUploadS3Service;

    public ErrorFileWriterListener(BulkUploadS3Service bulkUploadS3Service) {
        this.bulkUploadS3Service = bulkUploadS3Service;
    }

    @OnSkipInWrite
    public void onSkipInWrite(Row item, Throwable t) {
        try {
            FileWriter fileWriter = new FileWriter(bulkUploadS3Service.getLocalErrorFile(uuid), true);
            fileWriter.append(item.toString());
            fileWriter.append(',');
            fileWriter.append(t.getMessage());
            fileWriter.append('\n');
            fileWriter.close();

            System.out.println("t.getMessage()" + t.getMessage());
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException(format("Error recording error: '%s'", e.getMessage()));
        }
    }
}

