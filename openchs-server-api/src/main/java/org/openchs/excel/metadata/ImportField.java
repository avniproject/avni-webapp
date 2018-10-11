package org.openchs.excel.metadata;

import com.sun.org.apache.xpath.internal.operations.Bool;
import org.apache.poi.ss.usermodel.Row;
import org.openchs.excel.ImportSheetHeader;

import java.util.Date;

public interface ImportField {
    String getSystemFieldName();
    String getTextValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData);

    Double getDoubleValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData);

    Date getDateValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData);
    Boolean getBooleanValue(Row row, ImportSheetHeader importSheetHeader, ImportSheetMetaData importSheetMetaData);

    Boolean doIgnoreMissingAnswers();
}
