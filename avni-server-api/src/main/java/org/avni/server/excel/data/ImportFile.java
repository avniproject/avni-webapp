package org.avni.server.excel.data;

import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.IOException;
import java.io.InputStream;

public class ImportFile {
    private final Workbook workbook;

    public ImportFile(InputStream inputStream) throws IOException {
        workbook = new XSSFWorkbook(inputStream);
    }

    public ImportSheet getSheet(String sheetName) {
        return new ImportSheet(workbook.getSheet(sheetName));
    }

    public void close() {
        try {
            workbook.close();
        } catch (Exception e) {

        }
    }
}
