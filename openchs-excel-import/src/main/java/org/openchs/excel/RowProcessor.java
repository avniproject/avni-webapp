package org.openchs.excel;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Checklist;
import org.openchs.domain.ChecklistItem;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptDataType;
import org.openchs.healthmodule.adapter.ProgramEnrolmentModuleInvoker;
import org.openchs.healthmodule.adapter.contract.ChecklistItemRuleResponse;
import org.openchs.healthmodule.adapter.contract.ChecklistRuleResponse;
import org.openchs.healthmodule.adapter.contract.ProgramEnrolmentDecisionRuleResponse;
import org.openchs.healthmodule.adapter.contract.ProgramEnrolmentRuleInput;
import org.openchs.service.ChecklistService;
import org.openchs.util.O;
import org.openchs.web.*;
import org.openchs.web.request.*;
import org.openchs.web.request.application.ChecklistItemRequest;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class RowProcessor {
    private List<String> registrationHeader = new ArrayList<String>();
    private List<String> enrolmentHeader = new ArrayList<String>();
    private List<String> programEncounterHeader = new ArrayList<String>();
    private List<String> checklistHeader = new ArrayList<String>();
    private IndividualController individualController;
    private ProgramEnrolmentController programEnrolmentController;
    private ProgramEncounterController programEncounterController;
    private IndividualRepository individualRepository;
    private ChecklistController checklistController;
    private ChecklistItemController checklistItemController;
    private ChecklistService checklistService;
    private ConceptRepository conceptRepository;

    RowProcessor(IndividualController individualController, ProgramEnrolmentController programEnrolmentController, ProgramEncounterController programEncounterController, IndividualRepository individualRepository, ChecklistController checklistController, ChecklistItemController checklistItemController, ChecklistService checklistService, ConceptRepository conceptRepository) {
        this.individualController = individualController;
        this.programEnrolmentController = programEnrolmentController;
        this.programEncounterController = programEncounterController;
        this.individualRepository = individualRepository;
        this.checklistController = checklistController;
        this.checklistItemController = checklistItemController;
        this.checklistService = checklistService;
        this.conceptRepository = conceptRepository;
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
        for (int i = 1; i < registrationHeader.size() + 1; i++) {
            String cellHeader = registrationHeader.get(i - 1);
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
            } else if (cellHeader.equals("Address")) {
                individualRequest.setAddressLevel(ExcelUtil.getText(row, i));
            } else {
                individualRequest.addObservation(getObservationRequest(row, i, cellHeader));
            }
        }
        individualController.save(individualRequest);
    }

    private ObservationRequest getObservationRequest(Row row, int i, String cellHeader) {
        String cell = ExcelUtil.getText(row, i);
        if (cell.isEmpty()) return null;
        ObservationRequest observationRequest = new ObservationRequest();
        observationRequest.setConceptName(cellHeader);
        Concept concept = conceptRepository.findByName(cellHeader);
        if (concept == null) throw new NullPointerException(String.format("Concept with name |%s| not found", cellHeader));
        observationRequest.setValue(getPrimitiveValue(concept, cell));
        return observationRequest;
    }

    public Object getPrimitiveValue(Concept concept, String visibleText) {
        if (ConceptDataType.Numeric.toString().equals(concept.getDataType())) return Double.parseDouble(visibleText);
        if (ConceptDataType.Date.toString().equals(concept.getDataType())) return O.getDateInDbFormat(visibleText);
        return visibleText;
    }

    void readEnrolmentHeader(Row row) {
        readHeader(row, enrolmentHeader, 2);
    }

    void readProgramEncounterHeader(Row row) {
        readHeader(row, programEncounterHeader, 1);
    }

    void processEnrolment(Row row, String programName, ProgramEnrolmentModuleInvoker programEnrolmentModuleInvoker) {
        ProgramEnrolmentRequest programEnrolmentRequest = new ProgramEnrolmentRequest();
        programEnrolmentRequest.setProgram(programName);
        programEnrolmentRequest.setObservations(new ArrayList<ObservationRequest>());
        programEnrolmentRequest.setProgramExitObservations(new ArrayList<ObservationRequest>());
        programEnrolmentRequest.setIndividualUUID(ExcelUtil.getText(row, 0));
        programEnrolmentRequest.setUuid(ExcelUtil.getText(row, 1));
        for (int i = 2; i < enrolmentHeader.size() + 2; i++) {
            String cellHeader = enrolmentHeader.get(i - 2);
            if (cellHeader.equals("Enrolment Date")) {
                programEnrolmentRequest.setEnrolmentDateTime(new DateTime(ExcelUtil.getDate(row, i)));
            } else {
                programEnrolmentRequest.addObservation(getObservationRequest(row, i, cellHeader));
            }
        }

        ProgramEnrolmentRuleInput programEnrolmentRuleInput = new ProgramEnrolmentRuleInput(programEnrolmentRequest, individualRepository, conceptRepository);
        List<ObservationRequest> observationRequests = programEnrolmentModuleInvoker.getDecisions(programEnrolmentRuleInput, conceptRepository);
        observationRequests.forEach(programEnrolmentRequest::addObservation);
        programEnrolmentController.save(programEnrolmentRequest);

        Checklist checklist = checklistService.findChecklist(programEnrolmentRequest.getUuid());

        ChecklistRuleResponse checklistRuleResponse = programEnrolmentModuleInvoker.getChecklist(programEnrolmentRuleInput);
        if (checklistRuleResponse != null) {
            ChecklistRequest checklistRequest = new ChecklistRequest();
            checklistRequest.setUuid(checklist == null ? UUID.randomUUID().toString() : checklist.getUuid());
            checklistRequest.setBaseDate(checklistRuleResponse.getBaseDate());
            checklistRequest.setName(checklistRuleResponse.getName());
            checklistRequest.setProgramEnrolmentUUID(programEnrolmentRequest.getUuid());
            checklistController.save(checklistRequest);

            List<ChecklistItemRuleResponse> items = checklistRuleResponse.getItems();
            for (ChecklistItemRuleResponse checklistItemRuleResponse : items) {
                ChecklistItem checklistItem = checklistService.findChecklistItem(programEnrolmentRequest.getUuid(), checklistItemRuleResponse.getName());
                ChecklistItemRequest checklistItemRequest = new ChecklistItemRequest();
                checklistItemRequest.setUuid(checklistItem == null ? UUID.randomUUID().toString() : checklistItem.getUuid());
                checklistItemRequest.setChecklistUUID(checklistRequest.getUuid());
                checklistItemRequest.setDueDate(new DateTime(checklistItemRuleResponse.getDueDate()));
                checklistItemRequest.setMaxDate(new DateTime(checklistItemRuleResponse.getMaxDate()));
                Concept concept = conceptRepository.findByName(checklistItemRuleResponse.getName());
                if (concept == null) throw new RuntimeException(String.format("Couldn't find concept with name=%s in checklist being created from the rule", checklistItemRuleResponse.getName()));
                checklistItemRequest.setConceptUUID(concept.getUuid());
                checklistItemController.save(checklistItemRequest);
            }
        }
        System.out.println(String.format("Imported Enrolment for Program: %s, Enrolment: %s", programEnrolmentRequest.getProgram(), programEnrolmentRequest.getUuid()));
    }

    void processProgramEncounter(Row row) {
        int numberOfStaticColumns = 1;
        ProgramEncounterRequest programEncounterRequest = new ProgramEncounterRequest();
        programEncounterRequest.setObservations(new ArrayList<ObservationRequest>());
        programEncounterRequest.setProgramEnrolmentUUID(ExcelUtil.getText(row, 0));
        programEncounterRequest.setUuid(UUID.randomUUID().toString());
        for (int i = numberOfStaticColumns; i < programEncounterHeader.size() + numberOfStaticColumns; i++) {
            String cellHeader = programEncounterHeader.get(i - numberOfStaticColumns);
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
        programEncounterController.save(programEncounterRequest);
    }

    void readChecklistHeader(Row row) {
        readHeader(row, checklistHeader,2);
    }

    void processChecklist(Row row) {
        int numberOfStaticColumns = 2;
        String programEnrolmentUUID = ExcelUtil.getText(row, 0);
        String checklistName = ExcelUtil.getText(row, 1);

        for (int i = numberOfStaticColumns; i < checklistHeader.size() + numberOfStaticColumns; i++) {
            String checklistItemName = checklistHeader.get(i - numberOfStaticColumns);
            ChecklistItem checklistItem = checklistService.findChecklistItem(programEnrolmentUUID, checklistItemName);
            if (checklistItem == null) throw new RuntimeException(String.format("Couldn't find checklist item with name=%s", checklistItemName));
            Double offsetFromDueDate = ExcelUtil.getNumber(row, i);

            DateTime completionDate = null;
            if (offsetFromDueDate != null) {
                DateTime dueDate = checklistItem.getDueDate();
                completionDate = dueDate.plusDays(offsetFromDueDate.intValue());
                if (completionDate.isAfterNow()) completionDate = null;
            }

            checklistItem.setCompletionDate(completionDate);
            checklistService.saveItem(checklistItem);
        }
    }
}