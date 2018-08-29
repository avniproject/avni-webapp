package org.openchs.excel.data;



import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.openchs.excel.ExcelUtil;
import org.openchs.excel.ImportSheetHeader;

public class ImportSheet {
    private final ImportSheetHeader importSheetHeader;
    private Sheet xssfSheet;

    public ImportSheet(Sheet xssfSheet) {
        this.xssfSheet = xssfSheet;
        Row row = xssfSheet.getRow(0);
        importSheetHeader = new ImportSheetHeader(row);
    }

    public int getNumberOfDataRows() {
        return xssfSheet.getPhysicalNumberOfRows() - 1;
    }

    public Row getDataRow(int rowIndex) {
        Row row = xssfSheet.getRow(rowIndex + 1);
        if (row == null) return null;
        String rawCellValue = ExcelUtil.getRawCellValue(row, 0);
        return rawCellValue == null || rawCellValue.isEmpty() ? null : row;
    }

    public ImportSheetHeader getHeader() {
        return importSheetHeader;
    }
}