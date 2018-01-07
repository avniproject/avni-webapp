package org.openchs.excel;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.Ignore;
import org.junit.Test;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Date;
import java.util.Iterator;

public class SampleExcelDataImportTest {
    @Test
    public void importFile() throws Exception {
        InputStream inputStream = new FileInputStream("/Users/vsingh/Downloads/sample.xlsx");
        try {
            XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
            XSSFSheet sheet = workbook.getSheetAt(0);
            Iterator<Row> iterator = sheet.iterator();
            int k = 0;
            while (iterator.hasNext()) {
                k++;
                Row row = iterator.next();
                if (k < 2) {
                    continue;
                }
                System.out.println(ExcelUtil.getText(row, 0));
                Date date = ExcelUtil.getDateFromString(row, 0);
                System.out.println(date);
            }
        } finally {
            inputStream.close();
        }
    }
}