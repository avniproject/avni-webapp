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
import org.openchs.excel.metadata.ImportSheetMetaData;
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

    void processIndividual(Row row, ImportSheetHeader importSheetHeader, List<ImportField> importFields, ImportSheetMetaData importSheetMetaData) {
        Form form = formService.findForm(FormType.IndividualProfile, null, null);
        IndividualRequest individualRequest = new IndividualRequest();
        individualRequest.setObservations(new ArrayList<>());
        importFields.forEach(importField -> {
            String systemFieldName = importField.getSystemFieldName();
            switch (systemFieldName) {
                case "First Name":
                    individualRequest.setFirstName(importField.getTextValue(row, importSheetHeader, importSheetMetaData));
                    break;
                case "Last Name":
                    individualRequest.setLastName(importField.getTextValue(row, importSheetHeader, importSheetMetaData));
                    break;
                case "Date of Birth":
                    individualRequest.setDateOfBirth(new LocalDate(importField.getDateValue(row, importSheetHeader, importSheetMetaData)));
                    break;
                case "Date of Birth Verified":
                    individualRequest.setDateOfBirthVerified(importField.getBooleanValue(row, importSheetHeader, importSheetMetaData));
                    break;
                case "Gender":
                    individualRequest.setGender(TextToType.toGender(importField.getTextValue(row, importSheetHeader, importSheetMetaData)));
                    break;
                case "Registration Date":
                    individualRequest.setRegistrationDate(new LocalDate(importField.getDateValue(row, importSheetHeader, importSheetMetaData)));
                    break;
                case "Address":
                    individualRequest.setAddressLevel(importField.getTextValue(row, importSheetHeader, importSheetMetaData));
                    break;
                case "Individual UUID":
                    individualRequest.setUuid(importField.getTextValue(row, importSheetHeader, importSheetMetaData));
                    break;
                default:
                    individualRequest.addObservation(createObservationRequest(row, importSheetHeader, importSheetMetaData, form, importField, systemFieldName));
                    break;
            }
        });
        individualRequest.setupUuidIfNeeded();
        List<FormElement> unfilledMandatoryFormElements = formService.getUnfilledMandatoryFormElements(form, RequestUtil.fromObservationRequests(individualRequest.getObservations()));
        if (unfilledMandatoryFormElements.size() != 0) {
            throw new RuntimeException(String.format("Mandatory form-elements not present: %s", Arrays.toString(unfilledMandatoryFormElements.toArray())));
        }
        individualController.save(individualRequest);
        this.logger.info(String.format("Imported Individual: %s", individualRequest.getUuid()));
    }

    private ObservationRequest createObservationRequest(Row row, ImportSheetHeader sheetHeader, ImportSheetMetaData sheetMetaData, Form form, ImportField importField, String systemFieldName) {
        String cell = importField.getTextValue(row, sheetHeader, sheetMetaData);
        if (cell.isEmpty()) {
            FormElement formElement = form.findFormElement(systemFieldName);
            if (formElement.isMandatory()) throw new RuntimeException(String.format("Invalid data in row=%d, cell=%s", row.getRowNum(), systemFieldName));
            return null;
        }
        ObservationRequest observationRequest = new ObservationRequest();
        observationRequest.setConceptName(systemFieldName);
        Concept concept = conceptRepository.findByName(systemFieldName);
        if (concept == null)
            throw new NullPointerException(String.format("Concept with name |%s| not found", systemFieldName));
        observationRequest.setValue(concept.getPrimitiveValue(cell));
        return observationRequest;
    }

    void processEnrolment(Row row, ImportSheetHeader importSheetHeader, List<ImportField> importFields, ImportSheetMetaData sheetMetaData, ProgramEnrolmentModuleInvoker programEnrolmentModuleInvoker) {
        ProgramEnrolmentRequest programEnrolmentRequest = new ProgramEnrolmentRequest();
        programEnrolmentRequest.setProgram(sheetMetaData.getProgramName());
        programEnrolmentRequest.setObservations(new ArrayList<>());
        programEnrolmentRequest.setProgramExitObservations(new ArrayList<>());

        Form form = formService.findForm(FormType.ProgramEnrolment, null, sheetMetaData.getProgramName());
        importFields.forEach(importField -> {
            String systemFieldName = importField.getSystemFieldName();
            switch (systemFieldName) {
                case "Enrolment UUID":
                    programEnrolmentRequest.setUuid(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "Individual UUID":
                    programEnrolmentRequest.setIndividualUUID(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "Enrolment Date":
                    programEnrolmentRequest.setEnrolmentDateTime(new DateTime(importField.getDateValue(row, importSheetHeader, sheetMetaData)));
                    break;
                default:
                    programEnrolmentRequest.addObservation(createObservationRequest(row, importSheetHeader, sheetMetaData, form, importField, systemFieldName));
                    break;
            }
        });
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
        scheduledVisits.forEach(programEncounterRequest -> programEncounterController.save(programEncounterRequest));
        this.logger.info(String.format("Imported Enrolment for Program: %s, Enrolment: %s", programEnrolmentRequest.getProgram(), programEnrolmentRequest.getUuid()));
    }

    void processProgramEncounter(Row row, ImportSheetHeader importSheetHeader, List<ImportField> importFields, ImportSheetMetaData sheetMetaData, ProgramEncounterRuleInvoker ruleInvoker) {
        Form form = formService.findForm(FormType.ProgramEncounter, sheetMetaData.getEncounterType(), sheetMetaData.getProgramName());
        ProgramEncounterRequest programEncounterRequest = new ProgramEncounterRequest();
        programEncounterRequest.setObservations(new ArrayList<>());

        importFields.forEach(importField -> {
            String systemFieldName = importField.getSystemFieldName();
            switch (systemFieldName) {
                case "Enrolment UUID":
                    programEncounterRequest.setProgramEnrolmentUUID(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "UUID":
                    programEncounterRequest.setUuid(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "Visit Type":
                    programEncounterRequest.setEncounterType(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "Visit Name":
                    programEncounterRequest.setName(importField.getTextValue(row, importSheetHeader, sheetMetaData));
                    break;
                case "Earliest Date":
                    programEncounterRequest.setEarliestVisitDateTime(new DateTime(importField.getDateValue(row, importSheetHeader, sheetMetaData)));
                    break;
                case "Actual Date":
                    programEncounterRequest.setEncounterDateTime(new DateTime(importField.getDateValue(row, importSheetHeader, sheetMetaData)));
                    break;
                case "Max Date":
                    programEncounterRequest.setMaxDateTime(new DateTime(importField.getDateValue(row, importSheetHeader, sheetMetaData)));
                    break;
                default:
                    programEncounterRequest.addObservation(createObservationRequest(row, importSheetHeader, sheetMetaData, form, importField, systemFieldName));
                    break;
            }
        });

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
        scheduledVisits.forEach(scheduledProgramEncounterRequest -> programEncounterController.save(scheduledProgramEncounterRequest));
        this.logger.info(String.format("Imported ProgramEncounter for Enrolment: %s", programEncounterRequest.getProgramEnrolmentUUID()));
    }

    private ProgramEncounter matchAndUseExistingProgramEncounter(ProgramEncounterRequest programEncounterRequest) {
        return programEnrolmentService.matchingEncounter(programEncounterRequest.getProgramEnrolmentUUID(), programEncounterRequest.getEncounterType(), programEncounterRequest.getEncounterDateTime());
    }

    void processChecklist(Row row) {
//        List<String> checklistHeader = excelFileHeaders.getChecklistHeaders().get(sheetMetaData);
        List<String> checklistHeader = new ArrayList<>();
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