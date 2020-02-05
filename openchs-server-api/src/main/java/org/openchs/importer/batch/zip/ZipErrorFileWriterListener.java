package org.openchs.importer.batch.zip;

import org.openchs.importer.batch.model.JsonFile;
import org.openchs.service.BulkUploadS3Service;
import org.springframework.batch.core.annotation.OnSkipInWrite;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.FileWriter;
import java.io.IOException;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.lang.String.format;

@Component
@StepScope
public class ZipErrorFileWriterListener {

    private final BulkUploadS3Service bulkUploadS3Service;
    @Value("#{jobParameters['uuid']}")
    private String uuid;

    public ZipErrorFileWriterListener(BulkUploadS3Service bulkUploadS3Service) {
        this.bulkUploadS3Service = bulkUploadS3Service;
    }

    @OnSkipInWrite
    public void onSkipInWrite(JsonFile jsonFile, Throwable throwable) {
        writeError(jsonFile, throwable);
    }

    public void writeError(JsonFile jsonFile, Throwable t) {
        try {
            String stackTrace = Stream.of(t.getStackTrace())
                    .map(StackTraceElement::toString)
                    .collect(Collectors.joining("\n"));
            FileWriter fileWriter = new FileWriter(bulkUploadS3Service.getLocalErrorFile(uuid), true);
            fileWriter.append(jsonFile.getName());
            fileWriter.append(",\"");
            fileWriter.append(t.getMessage().replaceAll("\"", "\"\""));
            fileWriter.append("\n");
            fileWriter.append(stackTrace);
            fileWriter.append("\"\n");
            fileWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException(format("Error recording error: '%s'", e.getMessage()));
        }
    }
}

