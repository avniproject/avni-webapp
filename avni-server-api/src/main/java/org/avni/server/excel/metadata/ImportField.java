package org.avni.server.excel.metadata;

import org.apache.poi.ss.usermodel.Row;
import org.avni.server.excel.ImportSheetHeader;

import java.util.Date;

public interface ImportField {
    String getSystemFieldName();
    String getTextValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData);

    Double getDoubleValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData);

    Date getDateValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData);
    Boolean getBooleanValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData);

    Boolean doIgnoreMissingAnswers();
}
