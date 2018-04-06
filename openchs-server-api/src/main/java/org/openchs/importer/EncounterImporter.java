package org.openchs.importer;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.DateTime;
import org.openchs.excel.ImportSheetHeader;
import org.openchs.excel.metadata.ImportAnswerMetaDataList;
import org.openchs.excel.metadata.ImportField;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.web.EncounterController;
import org.openchs.web.request.EncounterRequest;
import org.openchs.web.request.ObservationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class EncounterImporter extends Importer<EncounterRequest> {
    @Autowired
    private EncounterController encounterController;

    @Override
    protected Boolean processRequest(EncounterRequest encounterRequest) {
        if (encounterRequest.getUuid() == null)
            encounterRequest.setupUuidIfNeeded();
        encounterController.save(encounterRequest);
        return true;
    }

    @Override
    protected EncounterRequest makeRequest(List<ImportField> importFields, ImportSheetHeader header, ImportSheetMetaData sheetMetaData, Row row, ImportAnswerMetaDataList answerMetaDataList) {
        EncounterRequest encounterRequest = new EncounterRequest();
        encounterRequest.setObservations(new ArrayList<>());
        importFields.forEach(importField -> {
            String systemFieldName = importField.getSystemFieldName();
            switch (systemFieldName) {
                case "Individual UUID":
                    encounterRequest.setIndividualUUID(importField.getTextValue(row, header, sheetMetaData));
                    break;
                case "Visit Type":
                    encounterRequest.setEncounterType(importField.getTextValue(row, header, sheetMetaData));
                    break;
                case "Encounter DateTime":
                    encounterRequest.setEncounterDateTime(new DateTime(importField.getDateValue(row, header, sheetMetaData)));
                    break;
                default:
                    ObservationRequest observationRequest = createObservationRequest(row, header, sheetMetaData, importField, systemFieldName, answerMetaDataList);
                    if (observationRequest == null) break;
                    List<ObservationRequest> observations = encounterRequest.getObservations();
                    this.mergeObservations(observations, observationRequest);
                    encounterRequest.setObservations(observations);
                    break;
            }
        });
        encounterRequest.setEncounterType(sheetMetaData.getEncounterType());
        return encounterRequest;
    }
}
