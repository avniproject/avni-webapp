package org.avni.server.importer;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.DateTime;
import org.avni.server.application.FormType;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.UserRepository;
import org.avni.server.dao.application.FormElementRepository;
import org.avni.server.excel.ImportSheetHeader;
import org.avni.server.excel.metadata.ImportAnswerMetaDataList;
import org.avni.server.excel.metadata.ImportCalculatedFields;
import org.avni.server.excel.metadata.ImportField;
import org.avni.server.excel.metadata.ImportSheetMetaData;
import org.avni.server.web.ProgramEnrolmentController;
import org.avni.server.web.request.ObservationRequest;
import org.avni.server.web.request.ProgramEnrolmentRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ProgramEnrolmentImporter extends Importer<ProgramEnrolmentRequest> {
    private final ProgramEnrolmentController programEnrolmentController;

    @Autowired
    public ProgramEnrolmentImporter(ConceptRepository conceptRepository, FormElementRepository formElementRepository, ProgramEnrolmentController programEnrolmentController, UserRepository userRepository) {
        super(conceptRepository, formElementRepository, userRepository);
        this.programEnrolmentController = programEnrolmentController;
    }

    @Override
    protected Boolean processRequest(ProgramEnrolmentRequest entityRequest) {
        programEnrolmentController.save(entityRequest);
        return true;
    }

    @Override
    protected ProgramEnrolmentRequest makeRequest(List<ImportField> importFields, ImportSheetHeader header, ImportSheetMetaData sheetMetaData, Row row, ImportAnswerMetaDataList answerMetaDataList, ImportCalculatedFields calculatedFields) {
        ProgramEnrolmentRequest programEnrolmentRequest = new ProgramEnrolmentRequest();
        programEnrolmentRequest.setProgram(sheetMetaData.getProgramName());
        programEnrolmentRequest.setObservations(new ArrayList<>());
        programEnrolmentRequest.setProgramExitObservations(new ArrayList<>());
        importFields.forEach(importField -> {
            String systemFieldName = importField.getSystemFieldName();
            switch (systemFieldName) {
                case "Enrolment UUID":
                    programEnrolmentRequest.setUuid(importField.getTextValue(row, header, sheetMetaData));
                    break;
                case "Individual UUID":
                    programEnrolmentRequest.setIndividualUUID(importField.getTextValue(row, header, sheetMetaData));
                    break;
                case "Enrolment Date":
                    programEnrolmentRequest.setEnrolmentDateTime(new DateTime(importField.getDateValue(row, header, sheetMetaData)));
                    break;
                case "Address":
                    break;
                case "Exit Date":
                    programEnrolmentRequest.setProgramExitDateTime(new DateTime(importField.getDateValue(row, header, sheetMetaData)));
                    break;
                case "User":
                    setUser(header, sheetMetaData, row, importField);
                    break;
                case "Voided":
                    programEnrolmentRequest.setVoided(importField.getBooleanValue(row, header, sheetMetaData));
                    break;
                default:
                    ObservationRequest observationRequest = createObservationRequest(row, header, sheetMetaData, importField, systemFieldName, answerMetaDataList, calculatedFields);
                    if (sheetMetaData.getFormType().equals(FormType.ProgramExit))
                        programEnrolmentRequest.addExitObservation(observationRequest);
                    else
                        programEnrolmentRequest.addObservation(observationRequest);
                    break;
            }
        });
        programEnrolmentRequest.setupUuidIfNeeded();
        return programEnrolmentRequest;
    }
}
