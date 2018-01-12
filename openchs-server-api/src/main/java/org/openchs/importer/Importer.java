package org.openchs.importer;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.openchs.excel.metadata.ImportMetaData;
import org.openchs.excel.metadata.ImportSheetMetaData;

public interface Importer {
    Boolean importSheet(XSSFWorkbook workbook, ImportMetaData importMetaData, ImportSheetMetaData importSheetMetaData) throws Exception;
}
