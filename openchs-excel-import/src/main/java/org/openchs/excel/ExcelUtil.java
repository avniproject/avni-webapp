package org.openchs.excel;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;

import java.util.Date;

public class ExcelUtil {
    public static String getText(Row row, int cellNum) {
        Cell cell = row.getCell(cellNum);
        if (cell == null) return "";
        String stringCellValue = cell.toString();
        return stringCellValue.trim().replaceAll(" +", " ");
    }

    public static Date getDate(Row row, int cellNum) {
        Cell cell = row.getCell(cellNum);
        if (cell == null) return null;
        return cell.getDateCellValue();
    }
}