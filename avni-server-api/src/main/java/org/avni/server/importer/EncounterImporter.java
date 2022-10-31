package org.avni.server.importer;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.DateTime;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.UserRepository;
import org.avni.server.dao.application.FormElementRepository;
import org.avni.server.excel.ImportSheetHeader;
import org.avni.server.excel.metadata.ImportAnswerMetaDataList;
import org.avni.server.excel.metadata.ImportCalculatedFields;
import org.avni.server.excel.metadata.ImportField;
import org.avni.server.excel.metadata.ImportSheetMetaData;
import org.avni.server.web.EncounterController;
import org.avni.server.web.request.EncounterRequest;
import org.avni.server.web.request.ObservationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class EncounterImporter extends Importer<EncounterRequest> {
    private final EncounterController encounterController;

    @Autowired
    public EncounterImporter(ConceptRepository conceptRepository, FormElementRepository formElementRepository, EncounterController encounterController, UserRepository userRepository) {
        super(conceptRepository, formElementRepository, userRepository);
        this.encounterController = encounterController;
    }

    @Override
    protected Boolean processRequest(EncounterRequest encounterRequest) {
        if (encounterRequest.getObservations().isEmpty()) return false; // don't save encounter if observations is empty
        if (encounterRequest.getUuid() == null) encounterRequest.setupUuidIfNeeded();
        encounterController.save(encounterRequest);
        return true;
    }

    @Override
    protected EncounterRequest makeRequest(List<ImportField> importFields, ImportSheetHeader header, ImportSheetMetaData sheetMetaData, Row row, ImportAnswerMetaDataList answerMetaDataList, ImportCalculatedFields calculatedFields) {
        EncounterRequest encounterRequest = new EncounterRequest();
        encounterRequest.setObservations(new ArrayList<>());
        importFields.forEach(importField -> {
            String systemFieldName = importField.getSystemFieldName();
            switch (systemFieldName) {
                case "Individual UUID":
                    encounterRequest.setIndividualUUID(importField.getTextValue(row, header, sheetMetaData));
                    break;
                case "UUID":
                    encounterRequest.setUuid(importField.getTextValue(row, header, sheetMetaData));
                    break;
                case "Visit Type":
                    encounterRequest.setEncounterType(importField.getTextValue(row, header, sheetMetaData));
                    break;
                case "Encounter DateTime":
                    encounterRequest.setEncounterDateTime(new DateTime(importField.getDateValue(row, header, sheetMetaData)));
                    break;
                case "User":
                    setUser(header, sheetMetaData, row, importField);
                    break;
                case "Voided":
                    encounterRequest.setVoided(importField.getBooleanValue(row, header, sheetMetaData));
                    break;
                default:
                    ObservationRequest observationRequest = null;
                    try {
                        observationRequest = createObservationRequest(row, header, sheetMetaData, importField, systemFieldName, answerMetaDataList, calculatedFields, encounterRequest.getEncounterDateTime().toDate());
                    } catch (Exception e) { // let record import continue even if observation fails
                        logger.error(String.format("Failed to create observation '%s' in row '%d' with error %s", systemFieldName, row.getRowNum(), e.getMessage()));
                    }
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
