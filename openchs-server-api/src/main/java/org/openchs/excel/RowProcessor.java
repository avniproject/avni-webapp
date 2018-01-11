package org.openchs.excel;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.openchs.application.Form;
import org.openchs.application.FormElement;
import org.openchs.application.FormType;
import org.openchs.dao.ChecklistRepository;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.Checklist;
import org.openchs.domain.ChecklistItem;
import org.openchs.domain.Concept;
import org.openchs.domain.ProgramEncounter;
import org.openchs.excel.metadata.ImportField;
import org.openchs.excel.metadata.ImportMetaData;
import org.openchs.healthmodule.adapter.ProgramEncounterRuleInvoker;
import org.openchs.healthmodule.adapter.ProgramEnrolmentModuleInvoker;
import org.openchs.healthmodule.adapter.contract.checklist.ChecklistRuleResponse;
import org.openchs.healthmodule.adapter.contract.encounter.ProgramEncounterRuleInput;
import org.openchs.healthmodule.adapter.contract.enrolment.ProgramEnrolmentRuleInput;
import org.openchs.healthmodule.adapter.contract.validation.ValidationsRuleResponse;
import org.openchs.service.ChecklistService;
import org.openchs.service.FormService;
import org.openchs.service.ObservationService;
import org.openchs.service.ProgramEnrolmentService;
import org.openchs.web.*;
import org.openchs.web.request.*;
import org.openchs.web.request.application.ChecklistItemRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class RowProcessor {
    private final Logger logger;

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
    private ChecklistRepository checklistRepository;
    @Autowired
    private ConceptRepository conceptRepository;
    @Autowired
    private ProgramEnrolmentRepository programEnrolmentRepository;
    @Autowired
    private ProgramEnrolmentService programEnrolmentService;
    @Autowired
    private ObservationService observationService;
    @Autowired
    private FormService formService;

    public RowProcessor() {
        logger = LoggerFactory.getLogger(this.getClass());
    }

    void readRegistrationHeader(Row row, ExcelFileHeaders excelFileHeaders) {
        readHeader(row, excelFileHeaders.getRegistrationHeader());
    }

    private void readHeader(Row row, List<String> headerList) {
        for (int i = 0; i < row.getPhysicalNumberOfCells(); i++) {
            String text = ExcelUtil.getText(row, i);
            if (text == null || text.equals("")) break;

            headerList.add(text);
        }
    }

    void processIndividual(Row row, ExcelFileHeaders excelFileHeaders, ImportMetaData importMetaData, SheetMetaData sheetMetaData) {
        Form form = formService.findForm(FormType.IndividualProfile, null, null);
        IndividualRequest individualRequest = new IndividualRequest();
        individualRequest.setObservations(new ArrayList<>());
        List<String> registrationHeader = excelFileHeaders.getRegistrationHeader();
        for (int i = 0; i < registrationHeader.size(); i++) {
            String cellHeader = registrationHeader.get(i);
            String mappedField = importMetaData.getSystemField(FormType.IndividualProfile, cellHeader, sheetMetaData.getFileName());
            if (mappedField == null || mappedField.isEmpty()) continue;
            switch (mappedField) {
                case "First Name":
                    individualRequest.setFirstName(ExcelUtil.getText(row, i));
                    break;
                case "Last Name":
                    individualRequest.setLastName(ExcelUtil.getText(row, i));
                    break;
                case "Date of Birth":
                    individualRequest.setDateOfBirth(new LocalDate(ExcelUtil.getDateFromString(row, i)));
                    break;
                case "Date of Birth Verified":
                    individualRequest.setDateOfBirthVerified(TextToType.toBoolean(ExcelUtil.getText(row, i)));
                    break;
                case "Gender":
                    individualRequest.setGender(TextToType.toGender(ExcelUtil.getText(row, i)));
                    break;
                case "Registration Date":
                    individualRequest.setRegistrationDate(new LocalDate(ExcelUtil.getDate(row, i)));
                    break;
                case "Address":
                    individualRequest.setAddressLevel(ExcelUtil.getText(row, i));
                    break;
                case "Individual UUID":
                    individualRequest.setUuid(ExcelUtil.getText(row, i));
                    break;
                default:
                    individualRequest.addObservation(createObservationRequest(row, i, mappedField, form));
                    break;
            }
        }
        individualRequest.setupUuidIfNeeded();
        List<FormElement> unfilledMandatoryFormElements = formService.getUnfilledMandatoryFormElements(form, RequestUtil.fromObservationRequests(individualRequest.getObservations()));
        if (unfilledMandatoryFormElements.size() != 0) {
            throw new RuntimeException(String.format("Mandatory form-elements not present: %s", Arrays.toString(unfilledMandatoryFormElements.toArray())));
        }
        individualController.save(individualRequest);
        this.logger.info(String.format("Imported Individual: %s", individualRequest.getUuid()));
    }

    private ObservationRequest createObservationRequest(Row row, int i, String cellHeader, Form form) {
        String cell = ExcelUtil.getText(row, i);
        if (cell.isEmpty()) {
            FormElement formElement = form.findFormElement(cellHeader);
            if (formElement.isMandatory()) throw new RuntimeException(String.format("Invalid data in row=%d, cell=%s", row.getRowNum(), cellHeader));
            return null;
        }
        ObservationRequest observationRequest = new ObservationRequest();
        observationRequest.setConceptName(cellHeader);
        Concept concept = conceptRepository.findByName(cellHeader);
        if (concept == null)
            throw new NullPointerException(String.format("Concept with name |%s| not found", cellHeader));
        observationRequest.setValue(concept.getPrimitiveValue(cell));
        return observationRequest;
    }

    void readEnrolmentHeader(Row row, SheetMetaData sheetMetaData, ExcelFileHeaders excelFileHeaders) {
        ArrayList<String> enrolmentHeader = new ArrayList<>();
        excelFileHeaders.getEnrolmentHeaders().put(sheetMetaData, enrolmentHeader);
        readHeader(row, enrolmentHeader);
    }

    void readProgramEncounterHeader(Row row, SheetMetaData sheetMetaData, ExcelFileHeaders excelFileHeaders) {
        ArrayList<String> programEncounterHeader = new ArrayList<>();
        excelFileHeaders.getProgramEncounterHeaders().put(sheetMetaData, programEncounterHeader);
        readHeader(row, programEncounterHeader);
    }

    void processEnrolment(Row row, SheetMetaData sheetMetaData, ProgramEnrolmentModuleInvoker programEnrolmentModuleInvoker, ExcelFileHeaders excelFileHeaders, ImportMetaData importMetaData) {
        ProgramEnrolmentRequest programEnrolmentRequest = new ProgramEnrolmentRequest();
        programEnrolmentRequest.setProgram(sheetMetaData.getProgramName());
        programEnrolmentRequest.setObservations(new ArrayList<>());
        programEnrolmentRequest.setProgramExitObservations(new ArrayList<>());

        Form form = formService.findForm(FormType.ProgramEnrolment, null, sheetMetaData.getProgramName());
        List<String> enrolmentHeader = excelFileHeaders.getEnrolmentHeaders().get(sheetMetaData);
        for (int i = 0; i < enrolmentHeader.size(); i++) {
            String cellHeader = enrolmentHeader.get(i);
            String mappedField = importMetaData.getSystemField(FormType.ProgramEnrolment, cellHeader, sheetMetaData.getFileName());
            if (mappedField == null || mappedField.isEmpty()) continue;
            switch (mappedField) {
                case "Enrolment UUID":
                    programEnrolmentRequest.setUuid(ExcelUtil.getText(row, i));
                    break;
                case "Individual UUID":
                    programEnrolmentRequest.setIndividualUUID(ExcelUtil.getRawCellValue(row, i));
                    break;
                case "Enrolment Date":
                    programEnrolmentRequest.setEnrolmentDateTime(new DateTime(ExcelUtil.getDate(row, i)));
                    break;
                default:
                    programEnrolmentRequest.addObservation(createObservationRequest(row, i, mappedField, form));
                    break;
            }
        }
        programEnrolmentRequest.setupUuidIfNeeded();

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

    void processProgramEncounter(Row row, SheetMetaData sheetMetaData, ProgramEncounterRuleInvoker ruleInvoker, ExcelFileHeaders excelFileHeaders, ImportMetaData importMetaData) {
        Form form = formService.findForm(FormType.ProgramEncounter, sheetMetaData.getVisitType(), sheetMetaData.getProgramName());
        ProgramEncounterRequest programEncounterRequest = new ProgramEncounterRequest();
        programEncounterRequest.setObservations(new ArrayList<>());
        List<String> programEncounterHeader = excelFileHeaders.getProgramEncounterHeaders().get(sheetMetaData);
        for (int i = 0; i < programEncounterHeader.size(); i++) {
            String cellHeader = programEncounterHeader.get(i);
            String mappedField = importMetaData.getSystemField(FormType.ProgramEncounter, cellHeader, sheetMetaData.getFileName());
            if (mappedField == null || mappedField.isEmpty()) continue;
            switch (mappedField) {
                case "Enrolment UUID":
                    programEncounterRequest.setProgramEnrolmentUUID(ExcelUtil.getRawCellValue(row, i));
                    break;
                case "UUID":
                    programEncounterRequest.setUuid(ExcelUtil.getText(row, i));
                    break;
                case "Visit Type":
                    programEncounterRequest.setEncounterType(ExcelUtil.getText(row, i));
                    break;
                case "Visit Name":
                    programEncounterRequest.setName(ExcelUtil.getText(row, i));
                    break;
                case "Earliest Date":
                    programEncounterRequest.setEarliestVisitDateTime(new DateTime(ExcelUtil.getDate(row, i)));
                    break;
                case "Actual Date":
                    programEncounterRequest.setEncounterDateTime(new DateTime(ExcelUtil.getDate(row, i)));
                    break;
                case "Max Date":
                    programEncounterRequest.setMaxDateTime(new DateTime(ExcelUtil.getDate(row, i)));
                    break;
                default:
                    programEncounterRequest.addObservation(createObservationRequest(row, i, mappedField, form));
                    break;
            }
        }
        ProgramEncounter programEncounter = matchAndUseExistingProgramEncounter(programEncounterRequest);
        if (programEncounter == null)
            programEncounterRequest.setupUuidIfNeeded();
        else
            programEncounterRequest.setUuid(programEncounter.getUuid());

        ProgramEncounterRuleInput programEncounterRuleInput = new ProgramEncounterRuleInput(programEnrolmentRepository.findByUuid(programEncounterRequest.getProgramEnrolmentUUID()), conceptRepository, programEncounterRequest, observationService);
        List<ObservationRequest> observationRequests = ruleInvoker.getDecisions(programEncounterRuleInput, conceptRepository);
        observationRequests.forEach(programEncounterRequest::addObservation);
        programEncounterController.save(programEncounterRequest);

        List<ProgramEncounterRequest> scheduledVisits = ruleInvoker.getNextScheduledVisits(programEncounterRuleInput, programEncounterRequest.getProgramEnrolmentUUID());
        scheduledVisits.forEach(scheduledProgramEncounterRequest -> {
            programEncounterController.save(scheduledProgramEncounterRequest);
        });
        this.logger.info(String.format("Imported ProgramEncounter for Enrolment: %s", programEncounterRequest.getProgramEnrolmentUUID()));
    }

    private ProgramEncounter matchAndUseExistingProgramEncounter(ProgramEncounterRequest programEncounterRequest) {
        return programEnrolmentService.matchingEncounter(programEncounterRequest.getProgramEnrolmentUUID(), programEncounterRequest.getEncounterType(), programEncounterRequest.getEncounterDateTime());
    }

    void readChecklistHeader(Row row, SheetMetaData sheetMetaData, ExcelFileHeaders excelFileHeaders) {
        ArrayList<String> checklistHeader = new ArrayList<>();
        excelFileHeaders.getChecklistHeaders().put(sheetMetaData, checklistHeader);
        readHeader(row, checklistHeader);
    }

    void processChecklist(Row row, SheetMetaData sheetMetaData, ExcelFileHeaders excelFileHeaders) {
        List<String> checklistHeader = excelFileHeaders.getChecklistHeaders().get(sheetMetaData);
        String enrolmentUUID = null;
        String checklist = null;
        String checklistUUID = null;
        for (int i = 0; i < checklistHeader.size(); i++) {
            String header = checklistHeader.get(i);
            switch (header) {
                case "Enrolment UUID":
                    enrolmentUUID = ExcelUtil.getRawCellValue(row, i);
                    break;
                case "Checklist":
                    checklist = ExcelUtil.getText(row, i);
                    break;
                default:
                    Double offset = ExcelUtil.getNumber(row, i);
                    if (offset == null) break;

                    ChecklistItem checklistItem = checklistService.findChecklistItem(enrolmentUUID, header);
                    if (checklistItem != null) {
                        if (checklistUUID == null) //performance optimisation
                            checklistUUID = checklistRepository.findByProgramEnrolmentUuidAndName(enrolmentUUID, checklist).getUuid();
                        DateTime completionDate = checklistItem.getDueDate().plusDays(offset.intValue());
                        if (completionDate.isAfterNow())
                            break;

                        ChecklistItemRequest checklistItemRequest = new ChecklistItemRequest();
                        checklistItemRequest.setChecklistUUID(checklistUUID);
                        //we are not changing due and max dates in the import because these are created through the rules logic earlier
                        checklistItemRequest.setDueDate(checklistItem.getDueDate());
                        checklistItemRequest.setMaxDate(checklistItem.getMaxDate());
                        checklistItemRequest.setUuid(checklistItem.getUuid());
                        checklistItemRequest.setConceptUUID(checklistItem.getConcept().getUuid());
                        checklistItemRequest.setCompletionDate(completionDate);
                        checklistItemController.save(checklistItemRequest);
                    }
                    break;
            }
        }
        this.logger.info(String.format("Imported Checklist for Enrolment: %s", enrolmentUUID));
    }
}