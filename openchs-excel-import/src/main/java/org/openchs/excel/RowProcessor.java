package org.openchs.excel;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.LocalDate;
import org.openchs.web.IndividualController;
import org.openchs.web.request.IndividualRequest;
import org.openchs.web.request.ObservationRequest;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class RowProcessor {
    private List<String> registrationHeader = new ArrayList<String>();
    private static SimpleDateFormat dateFormatter = new SimpleDateFormat("dd-MM-yyyy");
    private IndividualController individualController;

    public RowProcessor(IndividualController individualController) {
        this.individualController = individualController;
    }

    public void processRow(Row row) {
        row.getPhysicalNumberOfCells();
    }

    public List<String> readRegistrationHeader(Row row) {
        for (int i = 1; i < row.getPhysicalNumberOfCells(); i++) {
            registrationHeader.add(ExcelUtil.getText(row, i));
        }
        return registrationHeader;
    }

    public void processRegistration(Row row) throws ParseException {
        IndividualRequest individualRequest = new IndividualRequest();
        individualRequest.setUuid(ExcelUtil.getText(row, 0));
        individualRequest.setObservations(new ArrayList<ObservationRequest>());
        for (int i = 1; i < row.getPhysicalNumberOfCells(); i++) {
            String cellHeader = registrationHeader.get(i - 1);
            if (cellHeader.equals("Name")) {
                String cell = ExcelUtil.getText(row, i);
                individualRequest.setName(cell);
            } else if (cellHeader.equals("Date of Birth")) {
                Date cell = ExcelUtil.getDate(row, i);
                individualRequest.setDateOfBirth(new LocalDate(cell));
            } else if (cellHeader.equals("Date of Birth Verified")) {
                String cell = ExcelUtil.getText(row, i);
                individualRequest.setDateOfBirthVerified(TextToType.toBoolean(cell));
            }
            else if (cellHeader.equals("Gender")) {
                String cell = ExcelUtil.getText(row, i);
                individualRequest.setGender(TextToType.toGender(cell));
            } else if (cellHeader.equals("Registration Date")) {
                Date cell = ExcelUtil.getDate(row, i);
                individualRequest.setRegistrationDate(new LocalDate(cell));
            } else {
                ObservationRequest observationRequest = new ObservationRequest();
                observationRequest.setConceptName(cellHeader);
                String cell = ExcelUtil.getText(row, i);
                observationRequest.setValue(cell);
                individualRequest.addObservation(observationRequest);
            }
        }
        individualController.save(individualRequest);
    }
}