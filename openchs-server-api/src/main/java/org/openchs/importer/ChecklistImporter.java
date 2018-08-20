package org.openchs.importer;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.DateTime;
import org.openchs.dao.ChecklistItemRepository;
import org.openchs.dao.ChecklistRepository;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.excel.ImportSheetHeader;
import org.openchs.excel.metadata.ImportAnswerMetaDataList;
import org.openchs.excel.metadata.ImportField;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.web.request.ChecklistRequest;
import org.openchs.web.request.EncounterRequest;
import org.openchs.web.request.ObservationRequest;
import org.openchs.web.request.application.ChecklistItemRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ChecklistImporter extends Importer<ChecklistRequest> {
    public ChecklistImporter(ConceptRepository conceptRepository, FormElementRepository formElementRepository) {
        super(conceptRepository, formElementRepository);
    }

    @Override
    protected Boolean processRequest(ChecklistRequest entityRequest) {
        return null;
    }

    @Override
    protected ChecklistRequest makeRequest(List<ImportField> allFields, ImportSheetHeader header, ImportSheetMetaData importSheetMetaData, Row row, ImportAnswerMetaDataList answerMetaDataList) {
        return null;
    }
}
