package org.openchs.excel;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.openchs.web.IndividualController;
import org.openchs.web.request.IndividualRequest;
import org.openchs.web.request.ObservationRequest;
import org.openchs.web.request.ProgramEncounterRequest;
import org.openchs.web.request.ProgramEnrolmentRequest;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

public class RowProcessor {
    private List<String> registrationHeader = new ArrayList<String>();
    private List<String> enrolmentHeader = new ArrayList<String>();
    private List<String> programEncounterHeader = new ArrayList<String>();
    private IndividualController individualController;

    RowProcessor(IndividualController individualController) {
        this.individualController = individualController;
    }

    public void processRow(Row row) {
        row.getPhysicalNumberOfCells();
    }

    void readRegistrationHeader(Row row) {
        readHeader(row, registrationHeader, 1);
    }

    private void readHeader(Row row, List<String> headerList, int startColumn) {
        for (int i = startColumn; i < row.getPhysicalNumberOfCells(); i++) {
            String text = ExcelUtil.getText(row, i);
            if (text == null || text.equals("")) break;

            headerList.add(text);
        }
    }

    void processRegistration(Row row) throws ParseException {
        IndividualRequest individualRequest = new IndividualRequest();
        individualRequest.setUuid(ExcelUtil.getText(row, 0));
        individualRequest.setObservations(new ArrayList<ObservationRequest>());
        for (int i = 0; i < registrationHeader.size(); i++) {
            String cellHeader = registrationHeader.get(i + 1);
            if (cellHeader.equals("Name")) {
                individualRequest.setName(ExcelUtil.getText(row, i));
            } else if (cellHeader.equals("Date of Birth")) {
                individualRequest.setDateOfBirth(new LocalDate(ExcelUtil.getDate(row, i)));
            } else if (cellHeader.equals("Date of Birth Verified")) {
                individualRequest.setDateOfBirthVerified(TextToType.toBoolean(ExcelUtil.getText(row, i)));
            } else if (cellHeader.equals("Gender")) {
                individualRequest.setGender(TextToType.toGender(ExcelUtil.getText(row, i)));
            } else if (cellHeader.equals("Registration Date")) {
                individualRequest.setRegistrationDate(new LocalDate(ExcelUtil.getDate(row, i)));
            } else {
                individualRequest.addObservation(getObservationRequest(row, i, cellHeader));
            }
        }
        individualController.save(individualRequest);
    }

    private ObservationRequest getObservationRequest(Row row, int i, String cellHeader) {
        ObservationRequest observationRequest = new ObservationRequest();
        observationRequest.setConceptName(cellHeader);
        String cell = ExcelUtil.getText(row, i);
        observationRequest.setValue(cell);
        return observationRequest;
    }

    void readEnrolmentHeader(Row row) {
        readHeader(row, enrolmentHeader, 2);
    }

    void readProgramEncounterHeader(Row row) {
        readHeader(row, programEncounterHeader, 1);
    }

    void processEnrolment(Row row) {
        ProgramEnrolmentRequest programEnrolmentRequest = new ProgramEnrolmentRequest();
        programEnrolmentRequest.setObservations(new ArrayList<ObservationRequest>());
        programEnrolmentRequest.setIndividualUUID(ExcelUtil.getText(row, 0));
        programEnrolmentRequest.setUuid(ExcelUtil.getText(row, 1));
        for (int i = 0; i < enrolmentHeader.size(); i++) {
            String cellHeader = enrolmentHeader.get(i + 2);
            if (cellHeader.equals("Enrolment Date")) {
                programEnrolmentRequest.setEnrolmentDateTime(new DateTime(ExcelUtil.getDate(row, i)));
            } else {
                programEnrolmentRequest.addObservation(getObservationRequest(row, i, cellHeader));
            }
        }
    }

    void processProgramEncounter(Row row) {
        ProgramEncounterRequest programEncounterRequest = new ProgramEncounterRequest();
        programEncounterRequest.setObservations(new ArrayList<ObservationRequest>());
        programEncounterRequest.setProgramEnrolmentUUID(ExcelUtil.getText(row, 0));
        for (int i = 0; i < programEncounterHeader.size(); i++) {
            String cellHeader = enrolmentHeader.get(i + 1);
            if (cellHeader.equals("Visit Type")) {
                programEncounterRequest.setEncounterType(ExcelUtil.getText(row, i));
            } else if (cellHeader.equals("Visit Name")) {
                programEncounterRequest.setName(ExcelUtil.getText(row, i));
            } else if (cellHeader.equals("Scheduled Date")) {
                programEncounterRequest.setScheduledDateTime(new DateTime(ExcelUtil.getDate(row, i)));
            } else if (cellHeader.equals("Actual Date")) {
                programEncounterRequest.setEncounterDateTime(new DateTime(ExcelUtil.getDate(row, i)));
            } else if (cellHeader.equals("Max Date")) {
                programEncounterRequest.setMaxDateTime(new DateTime(ExcelUtil.getDate(row, i)));
            } else {
                programEncounterRequest.addObservation(getObservationRequest(row, i, cellHeader));
            }
        }
    }
}