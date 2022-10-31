package org.avni.server.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import static java.lang.String.format;

@Service
public class ExportS3Service {

    public static final String FILE_NAME_EXTENSION = ".csv";
    private S3Service s3Service;
    private static Logger logger = LoggerFactory.getLogger(ExportS3Service.class);

    public ExportS3Service(@Qualifier("BatchS3Service") S3Service s3Service) {
        this.s3Service = s3Service;
    }

    public File getLocalExportFile(String uuid) {
        File exportDir = new File(format("%s/exports/", System.getProperty("java.io.tmpdir")));
        exportDir.mkdirs();
        return new File(exportDir, format("%s%s", uuid, FILE_NAME_EXTENSION));
    }

    public ObjectInfo uploadFile(File tempSourceFile, String uuid) throws IOException {
        logger.info(String.format("Uploading %s file to S3", tempSourceFile.getAbsolutePath()));
        return s3Service.uploadFile(tempSourceFile, format("%s%s", uuid, FILE_NAME_EXTENSION), "exports");
    }

    public InputStream downloadFile(String fileName) {
        return s3Service.downloadFile("exports", fileName);
    }

}
