package org.openchs.excel;

import org.junit.Ignore;
import org.junit.Test;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.InputStream;

@Ignore
public class SampleExcelDataImportTest extends AbstractControllerIntegrationTest {
    @Autowired
    private ExcelImporter excelImporter;

    @Test
    public void importFile() throws Exception {
        InputStream inputStream = this.getClass().getClassLoader().getResourceAsStream("TransactionData.xlsx");
        excelImporter.importData(inputStream);
    }
}