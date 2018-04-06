package org.openchs.importer;

import org.apache.poi.ss.usermodel.Row;
import org.openchs.excel.ImportSheetHeader;
import org.openchs.excel.metadata.ImportAnswerMetaDataList;
import org.openchs.excel.metadata.ImportField;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.web.request.ChecklistRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ChecklistImporter extends Importer<ChecklistRequest> {
    @Override
    protected Boolean processRequest(ChecklistRequest entityRequest) {
        return null;
    }

    @Override
    protected ChecklistRequest makeRequest(List<ImportField> allFields, ImportSheetHeader header, ImportSheetMetaData importSheetMetaData, Row row, ImportAnswerMetaDataList answerMetaDataList) {
        return null;
    }
}
