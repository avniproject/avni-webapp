package org.openchs.importer;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.DateTime;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.UserRepository;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.domain.ProgramEncounter;
import org.openchs.excel.ImportSheetHeader;
import org.openchs.excel.metadata.ImportAnswerMetaDataList;
import org.openchs.excel.metadata.ImportCalculatedFields;
import org.openchs.excel.metadata.ImportField;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.service.ProgramEnrolmentService;
import org.openchs.web.ProgramEncounterController;
import org.openchs.web.request.ProgramEncounterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
public class ProgramEncounterImporter extends Importer<ProgramEncounterRequest> {
    private final ProgramEncounterController programEncounterController;
    private final ProgramEnrolmentService programEnrolmentService;

    @Autowired
    public ProgramEncounterImporter(ConceptRepository conceptRepository, FormElementRepository formElementRepository, ProgramEncounterController programEncounterController, ProgramEnrolmentService programEnrolmentService, UserRepository userRepository) {
        super(conceptRepository, formElementRepository, userRepository);
        this.programEncounterController = programEncounterController;
        this.programEnrolmentService = programEnrolmentService;
    }

    private ProgramEncounter matchAndUseExistingProgramEncounter(ProgramEncounterRequest programEncounterRequest) {
        return programEnrolmentService.matchingEncounter(programEncounterRequest.getProgramEnrolmentUUID(), programEncounterRequest.getEncounterType(), programEncounterRequest.getEncounterDateTime());
    }

    @Override
    protected Boolean processRequest(ProgramEncounterRequest programEncounterRequest) {
        ProgramEncounter programEncounter = matchAndUseExistingProgramEncounter(programEncounterRequest);
        if (programEncounter == null)
            programEncounterRequest.setupUuidIfNeeded();
        else
            programEncounterRequest.setUuid(programEncounter.getUuid());
        programEncounterController.save(programEncounterRequest);
        return true;
    }

    @Override
    protected ProgramEncounterRequest makeRequest(List<ImportField> importFields, ImportSheetHeader header, ImportSheetMetaData sheetMetaData, Row row, ImportAnswerMetaDataList answerMetaDataList, ImportCalculatedFields calculatedFields) {
        ProgramEncounterRequest programEncounterRequest = new ProgramEncounterRequest();
        programEncounterRequest.setObservations(new ArrayList<>());
        importFields.forEach(importField -> {
            String systemFieldName = importField.getSystemFieldName();
            switch (systemFieldName) {
                case "Enrolment UUID":
                    programEncounterRequest.setProgramEnrolmentUUID(importField.getTextValue(row, header, sheetMetaData));
                    break;
                case "UUID":
                    programEncounterRequest.setUuid(importField.getTextValue(row, header, sheetMetaData));
                    break;
                case "Visit Type":
                    programEncounterRequest.setEncounterType(importField.getTextValue(row, header, sheetMetaData));
                    break;
                case "Visit Name":
                    programEncounterRequest.setName(importField.getTextValue(row, header, sheetMetaData));
                    break;
                case "Earliest Date":
                    programEncounterRequest.setEarliestVisitDateTime(new DateTime(importField.getDateValue(row, header, sheetMetaData)));
                    break;
                case "Actual Date":
                    programEncounterRequest.setEncounterDateTime(new DateTime(importField.getDateValue(row, header, sheetMetaData)));
                    break;
                case "Max Date":
                    programEncounterRequest.setMaxDateTime(new DateTime(importField.getDateValue(row, header, sheetMetaData)));
                    break;
                case "Address":
                    break;
                case "Cancel Date":
                    Date cancelDateTimeString = importField.getDateValue(row, header, sheetMetaData);
                    if (cancelDateTimeString != null) {
                        DateTime cancelDateTime = new DateTime(cancelDateTimeString);
                        programEncounterRequest.setCancelDateTime(cancelDateTime);
                        programEncounterRequest.setCancelObservations(programEncounterRequest.getObservations());
                        programEncounterRequest.setObservations(new ArrayList<>());
                    }
                    break;
                case "User":
                    setUser(header, sheetMetaData, row, importField);
                    break;
                case "Voided":
                    programEncounterRequest.setVoided(importField.getBooleanValue(row, header, sheetMetaData));
                    break;
                default:
                    programEncounterRequest.addObservation(createObservationRequest(row, header, sheetMetaData, importField, systemFieldName, answerMetaDataList, calculatedFields));
                    break;
            }
        });
        programEncounterRequest.setEncounterType(sheetMetaData.getEncounterType());
        return programEncounterRequest;
    }
}
