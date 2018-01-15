package org.openchs.importer;

import org.openchs.excel.DataImportResult;
import org.openchs.excel.data.ImportFile;
import org.openchs.excel.metadata.ImportMetaData;
import org.openchs.excel.metadata.ImportSheetMetaData;

public interface Importer {
    Boolean importSheet(ImportFile importFile, ImportMetaData importMetaData, ImportSheetMetaData importSheetMetaData, DataImportResult dataImportResult);
}
