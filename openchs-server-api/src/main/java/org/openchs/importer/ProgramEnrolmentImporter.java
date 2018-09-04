package org.openchs.importer;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.DateTime;
import org.openchs.application.FormType;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.UserRepository;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.excel.ImportSheetHeader;
import org.openchs.excel.metadata.ImportAnswerMetaDataList;
import org.openchs.excel.metadata.ImportCalculatedFields;
import org.openchs.excel.metadata.ImportField;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.web.ProgramEnrolmentController;
import org.openchs.web.request.ObservationRequest;
import org.openchs.web.request.ProgramEnrolmentRequest;
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
