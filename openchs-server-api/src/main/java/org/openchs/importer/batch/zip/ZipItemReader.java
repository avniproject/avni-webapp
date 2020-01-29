package org.openchs.importer.batch.zip;

import org.apache.commons.io.IOUtils;
import org.openchs.framework.security.AuthService;
import org.openchs.importer.batch.model.JsonFile;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemStreamException;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@StepScope
public class ZipItemReader implements ItemReader<JsonFile> {

    private List<JsonFile> jsonFiles = new ArrayList<>();
    private int nextFileIndex;

    public ZipItemReader(InputStream inputStream) {
        initialize(inputStream);
    }

    private void initialize(InputStream inputStream) {
        if (inputStream != null) {
            ZipInputStream stream = new ZipInputStream(inputStream);
            try {
                ZipEntry entry;
                while ((entry = stream.getNextEntry()) != null) {
                    if (!entry.isDirectory()) {
                        JsonFile jsonFile = new JsonFile(entry.getName(), IOUtils.toString(stream, StandardCharsets.UTF_8));
                        jsonFiles.add(jsonFile);
                    }
                }
            } catch (Exception ex) {
                throw new ItemStreamException(ex);
            } finally {
                try {
                    stream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        nextFileIndex = 0;
    }

    @Override
    public JsonFile read() throws Exception {
        JsonFile jsonFile = null;
        if (nextFileIndex < jsonFiles.size()) {
            jsonFile = jsonFiles.get(nextFileIndex);
            nextFileIndex++;
        }
        return jsonFile;
    }
}
