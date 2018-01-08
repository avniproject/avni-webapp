package org.openchs.excel;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.LoggerFactory;

import java.util.Date;

class ExcelUtil {
    private static DateTimeFormatter[] possibleFormatters = new DateTimeFormatter[]{DateTimeFormat.forPattern("dd/MMM/yyyy"), DateTimeFormat.forPattern("dd/M/yyyy"), DateTimeFormat.forPattern("dd-MMM-yyyy")};

    static String getText(Row row, int cellNum) {
        Cell cell = row.getCell(cellNum);
        if (cell == null) return "";
        String stringCellValue = cell.toString();
        return stringCellValue.trim().replaceAll(" +", " ");
    }

    static String getRawCellValue(Row row, int cellNum) {
        Cell cell = row.getCell(cellNum);
        if (cell == null) return null;
        return ((XSSFCell) cell).getRawValue();
    }

    static Date getDate(Row row, int cellNum) {
        Cell cell = null;
        try {
            cell = row.getCell(cellNum);
            if (cell == null) return null;
            return cell.getDateCellValue();
        } catch (RuntimeException e) {
            LoggerFactory.getLogger(ExcelUtil.class).error(String.format("getDate failed for row_number=%d, cell_number=%d, it contains:%s", row.getRowNum(), cellNum, cell.toString()));
            throw e;
        }
    }

    static Date getDateFromString(Row row, int cellNum) {
        String text = ExcelUtil.getText(row, cellNum);
        for (DateTimeFormatter possibleFormatter : possibleFormatters) {
            try {
                DateTime dateTime = possibleFormatter.parseDateTime(text);
                return dateTime.toDate();
            } catch (IllegalArgumentException ignored) {
            }
        }
        throw new IllegalArgumentException(String.format("Could not format:%s in any date format", text));
    }

    static Double getNumber(Row row, int cellNum) {
        Cell cell = null;
        try {
            cell = row.getCell(cellNum);
            if (cell == null) return null;
            if (cell.toString().isEmpty()) return null;
            return cell.getNumericCellValue();
        } catch (RuntimeException e) {
            LoggerFactory.getLogger(ExcelUtil.class).error(String.format("getNumber failed for row_number=%d, cell_number=%d, it contains:%s", row.getRowNum(), cellNum, cell.toString()));
            return null;
        }
    }

    static Boolean getBoolean(Row row, int cellNum) {
        Cell cell = null;
        try {
            cell = row.getCell(cellNum);
            if (cell == null) return null;
            if (cell.toString().isEmpty()) return null;
            return cell.getBooleanCellValue();
        } catch (RuntimeException e) {
            LoggerFactory.getLogger(ExcelUtil.class).error(String.format("getBoolean failed for row_number=%d, cell_number=%d, it contains:%s", row.getRowNum(), cellNum, cell.toString()));
            return null;
        }
    }
}