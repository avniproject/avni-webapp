package org.openchs.excel.metadata;

import org.junit.Test;
import org.openchs.excel.reader.ImportMetaDataExcelReader;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

public class ImportMetaDataTest {
    @Test
    public void importSample() throws IOException {
        ImportMetaDataExcelReader.readMetaData(new ClassPathResource("Import MetaData.xlsx").getInputStream());
    }
}