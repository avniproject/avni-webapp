package org.openchs.excel;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.ProgramEncounterRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.Checklist;
import org.openchs.domain.ChecklistItem;
import org.openchs.domain.Concept;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.healthmodule.adapter.ProgramEncounterRuleInvoker;
import org.openchs.healthmodule.adapter.ProgramEnrolmentModuleInvoker;
import org.openchs.healthmodule.adapter.contract.checklist.ChecklistRuleResponse;
import org.openchs.healthmodule.adapter.contract.encounter.ProgramEncounterRuleInput;
import org.openchs.healthmodule.adapter.contract.enrolment.ProgramEnrolmentRuleInput;
import org.openchs.healthmodule.adapter.contract.validation.ValidationsRuleResponse;
import org.openchs.service.ChecklistService;
import org.openchs.service.ObservationService;
import org.openchs.web.*;
import org.openchs.web.request.*;
import org.openchs.web.request.application.ChecklistItemRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.util.*;

@Component
public class RowProcessor {
    private final Logger logger;
    private List<String> registrationHeader = new ArrayList<>();
    private Map<SheetMetaData, List<String>> enrolmentHeaders = new HashMap<>();
    private Map<SheetMetaData, List<String>> programEncounterHeaders = new HashMap<>();
    private Map<SheetMetaData, List<String>> checklistHeaders = new HashMap<>();

    @Autowired
    private IndividualController individualController;
    @Autowired
    private ProgramEnrolmentController programEnrolmentController;
    @Autowired
    private ProgramEncounterController programEncounterController;
    @Autowired
    private IndividualRepository individualRepository;
    @Autowired
    private ChecklistController checklistController;
    @Autowired
    private ChecklistItemController checklistItemController;
    @Autowired
    private ChecklistService checklistService;
    @Autowired
    private ConceptRepository conceptRepository;
    @Autowired
    private ProgramEnrolmentRepository programEnrolmentRepository;
    @Autowired
    private ObservationService observationService;

    public RowProcessor() {
        logger = LoggerFactory.getLogger(this.getClass());
    }

    void readRegistrationHeader(Row row) {
        readHeader(row, registrationHeader);
    }

    private void readHeader(Row row, List<String> headerList) {
        for (int i = 0; i < row.getPhysicalNumberOfCells(); i++) {
            String text = ExcelUtil.getText(row, i);
            if (text == null || text.equals("")) break;

            headerList.add(text);
        }
    }

    void processIndividual(Row row) throws ParseException {
        IndividualRequest individualRequest = new IndividualRequest();
        individualRequest.setObservations(new ArrayList<>());
        for (int i = 0; i < registrationHeader.size(); i++) {
            String cellHeader = registrationHeader.get(i);
            if (cellHeader.equals("First Name")) {
                individualRequest.setFirstName(ExcelUtil.getText(row, i));
            } else if (cellHeader.equals("Last Name")) {
                individualRequest.setLastName(ExcelUtil.getText(row, i));
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
            } else if (cellHeader.equals("UUID")) {
                individualRequest.setUuid(ExcelUtil.getText(row, i));
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
        if (concept == null)
            throw new NullPointerException(String.format("Concept with name |%s| not found", cellHeader));
        observationRequest.setValue(concept.getPrimitiveValue(cell));
        return observationRequest;
    }

    public Object getPrimitiveValue(Concept concept, String visibleText) {
        return concept.getPrimitiveValue(visibleText);
    }

    void readEnrolmentHeader(Row row, SheetMetaData sheetMetaData) {
        ArrayList<String> enrolmentHeader = new ArrayList<>();
        enrolmentHeaders.put(sheetMetaData, enrolmentHeader);
        readHeader(row, enrolmentHeader);
    }

    void readProgramEncounterHeader(Row row, SheetMetaData sheetMetaData) {
        ArrayList<String> programEncounterHeader = new ArrayList<>();
        programEncounterHeaders.put(sheetMetaData, programEncounterHeader);
        readHeader(row, programEncounterHeader);
    }

    void processEnrolment(Row row, SheetMetaData sheetMetaData, ProgramEnrolmentModuleInvoker programEnrolmentModuleInvoker) {
        ProgramEnrolmentRequest programEnrolmentRequest = new ProgramEnrolmentRequest();
        programEnrolmentRequest.setProgram(sheetMetaData.getProgramName());
        programEnrolmentRequest.setObservations(new ArrayList<>());
        programEnrolmentRequest.setProgramExitObservations(new ArrayList<>());

        List<String> enrolmentHeader = enrolmentHeaders.get(sheetMetaData);
        for (int i = 0; i < enrolmentHeader.size(); i++) {
            String cellHeader = enrolmentHeader.get(i);
            if (cellHeader.equals("UUID")) {
                programEnrolmentRequest.setUuid(ExcelUtil.getText(row, i));
            } else if (cellHeader.equals("Individual UUID"))
                programEnrolmentRequest.setIndividualUUID(ExcelUtil.getRawCellValue(row, i));
            else if (cellHeader.equals("Enrolment Date")) {
                programEnrolmentRequest.setEnrolmentDateTime(new DateTime(ExcelUtil.getDate(row, i)));
            } else {
                programEnrolmentRequest.addObservation(getObservationRequest(row, i, cellHeader));
            }
        }

        ProgramEnrolmentRuleInput programEnrolmentRuleInput = new ProgramEnrolmentRuleInput(programEnrolmentRequest, individualRepository, conceptRepository);

        ValidationsRuleResponse validationsRuleResponse = programEnrolmentModuleInvoker.validate(programEnrolmentRuleInput);
        if (validationsRuleResponse != null && validationsRuleResponse.getValidationResults().size() > 0) {
            logger.error(validationsRuleResponse.toString());
            return;
        }

        List<ObservationRequest> observationRequests = programEnrolmentModuleInvoker.getDecisions(programEnrolmentRuleInput, conceptRepository);
        observationRequests.forEach(programEnrolmentRequest::addObservation);
        programEnrolmentController.save(programEnrolmentRequest);

        Checklist checklist = checklistService.findChecklist(programEnrolmentRequest.getUuid());
        ChecklistRuleResponse checklistRuleResponse = programEnrolmentModuleInvoker.getChecklist(programEnrolmentRuleInput);
        if (checklistRuleResponse != null) {
            ChecklistRequest checklistRequest = checklistRuleResponse.getChecklistRequest();
            checklistRequest.setProgramEnrolmentUUID(programEnrolmentRequest.getUuid());
            checklistRequest.setUuid(checklist == null ? UUID.randomUUID().toString() : checklist.getUuid());
            checklistController.save(checklistRequest);

            List<ChecklistItemRequest> items = checklistRuleResponse.getItems(checklistService, programEnrolmentRequest.getUuid(), conceptRepository);
            items.forEach(checklistItemRequest -> {
                checklistItemRequest.setChecklistUUID(checklistRequest.getUuid());
                checklistItemController.save(checklistItemRequest);
            });
        }

        List<ProgramEncounterRequest> scheduledVisits = programEnrolmentModuleInvoker.getNextScheduledVisits(programEnrolmentRuleInput, programEnrolmentRequest.getUuid());
        scheduledVisits.forEach(programEncounterRequest -> {
            programEncounterController.save(programEncounterRequest);
        });
        this.logger.info(String.format("Imported Enrolment for Program: %s, Enrolment: %s", programEnrolmentRequest.getProgram(), programEnrolmentRequest.getUuid()));
    }

    void processProgramEncounter(Row row, SheetMetaData sheetMetaData, ProgramEncounterRuleInvoker ruleInvoker) {
        ProgramEncounterRequest programEncounterRequest = new ProgramEncounterRequest();
        programEncounterRequest.setObservations(new ArrayList<>());
        List<String> programEncounterHeader = programEncounterHeaders.get(sheetMetaData);
        for (int i = 0; i < programEncounterHeader.size(); i++) {
            String cellHeader = programEncounterHeader.get(i);
            if (cellHeader.equals("Enrolment UUID")) {
                programEncounterRequest.setProgramEnrolmentUUID(ExcelUtil.getRawCellValue(row, i));
            } else if (cellHeader.equals("UUID")) {
                programEncounterRequest.setUuid(ExcelUtil.getText(row, i));
            } else if (cellHeader.equals("Visit Type")) {
                programEncounterRequest.setEncounterType(ExcelUtil.getText(row, i));
            } else if (cellHeader.equals("Visit Name")) {
                programEncounterRequest.setName(ExcelUtil.getText(row, i));
            } else if (cellHeader.equals("Earliest Date")) {
                programEncounterRequest.setEarliestVisitDateTime(new DateTime(ExcelUtil.getDate(row, i)));
            } else if (cellHeader.equals("Actual Date")) {
                programEncounterRequest.setEncounterDateTime(new DateTime(ExcelUtil.getDate(row, i)));
            } else if (cellHeader.equals("Max Date")) {
                programEncounterRequest.setMaxDateTime(new DateTime(ExcelUtil.getDate(row, i)));
            } else {
                programEncounterRequest.addObservation(getObservationRequest(row, i, cellHeader));
            }
        }
        ProgramEncounterRuleInput programEncounterRuleInput = new ProgramEncounterRuleInput(programEnrolmentRepository.findByUuid(programEncounterRequest.getProgramEnrolmentUUID()), conceptRepository, programEncounterRequest, observationService);
        List<ObservationRequest> observationRequests = ruleInvoker.getDecisions(programEncounterRuleInput, conceptRepository);
        observationRequests.forEach(programEncounterRequest::addObservation);
        programEncounterController.save(programEncounterRequest);

        List<ProgramEncounterRequest> scheduledVisits = ruleInvoker.getNextScheduledVisits(programEncounterRuleInput, programEncounterRequest.getProgramEnrolmentUUID());
        scheduledVisits.forEach(scheduledProgramEncounterRequest -> {
            programEncounterController.save(scheduledProgramEncounterRequest);
        });
    }

    void readChecklistHeader(Row row, SheetMetaData sheetMetaData) {
        ArrayList<String> checklistHeader = new ArrayList<>();
        programEncounterHeaders.put(sheetMetaData, checklistHeader);
        readHeader(row, checklistHeader);
    }

    void processChecklist(Row row, SheetMetaData sheetMetaData) {
        int numberOfStaticColumns = 2;
        String programEnrolmentUUID = ExcelUtil.getText(row, 0);
        String checklistName = ExcelUtil.getText(row, 1);
        List<String> checklistHeader = checklistHeaders.get(sheetMetaData);

        for (int i = numberOfStaticColumns; i < checklistHeader.size() + numberOfStaticColumns; i++) {
            String checklistItemName = checklistHeader.get(i - numberOfStaticColumns);
            ChecklistItem checklistItem = checklistService.findChecklistItem(programEnrolmentUUID, checklistItemName);
            if (checklistItem == null)
                throw new RuntimeException(String.format("Couldn't find checklist item with name=%s", checklistItemName));
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