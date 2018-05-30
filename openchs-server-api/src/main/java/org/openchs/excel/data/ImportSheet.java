package org.openchs.excel.data;


import org.apache.logging.log4j.util.Strings;

import org.apache.poi.ss.usermodel.Row;

import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.openchs.excel.ExcelUtil;
import org.openchs.excel.ImportSheetHeader;

public class ImportSheet {
    private final ImportSheetHeader importSheetHeader;
    private XSSFSheet xssfSheet;

    public ImportSheet(XSSFSheet xssfSheet) {
        this.xssfSheet = xssfSheet;
        XSSFRow row = xssfSheet.getRow(0);
        importSheetHeader = new ImportSheetHeader(row);
    }

    public int getNumberOfDataRows() {
        return xssfSheet.getPhysicalNumberOfRows() - 1;
    }

    public XSSFRow getDataRow(int rowIndex) {
        XSSFRow row = xssfSheet.getRow(rowIndex + 1);
        if (row == null) return null;
        String rawCellValue = ExcelUtil.getRawCellValue(row, 0);
        return rawCellValue == null || rawCellValue.isEmpty() ? null : row;
    }

    public ImportSheetHeader getHeader() {
        return importSheetHeader;
    }
}