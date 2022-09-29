package org.avni.server.excel.data;



import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.avni.server.excel.ExcelUtil;
import org.avni.server.excel.ImportSheetHeader;

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
        return ExcelUtil.isFirstCellEmpty(row)? null: row;
    }

    public ImportSheetHeader getHeader() {
        return importSheetHeader;
    }
}
