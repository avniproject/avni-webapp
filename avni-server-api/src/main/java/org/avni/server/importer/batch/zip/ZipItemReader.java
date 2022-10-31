package org.avni.server.importer.batch.zip;

import org.apache.commons.io.IOUtils;
import org.avni.server.importer.batch.model.BundleFile;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemStreamException;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@StepScope
public class ZipItemReader implements ItemReader<BundleFile> {

    private List<BundleFile> bundleFiles = new ArrayList<>();
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
                        BundleFile bundleFile = new BundleFile(entry.getName(), IOUtils.toByteArray(stream));
                        bundleFiles.add(bundleFile);
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
    public BundleFile read() throws Exception {
        BundleFile bundleFile = null;
        if (nextFileIndex < bundleFiles.size()) {
            bundleFile = bundleFiles.get(nextFileIndex);
            nextFileIndex++;
        }
        return bundleFile;
    }
}
