package org.openchs.excel;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.DateTime;
import org.openchs.application.Form;
import org.openchs.application.FormElement;
import org.openchs.application.FormType;
import org.openchs.dao.ChecklistRepository;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.Checklist;
import org.openchs.domain.ChecklistItem;
import org.openchs.domain.ProgramEncounter;
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
    private static Logger logger = LoggerFactory.getLogger(RowProcessor.class);

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

    void processIndividual(IndividualRequest individualRequest) {
        Form form = formService.findForm(FormType.IndividualProfile, null, null);
        List<FormElement> unfilledMandatoryFormElements = formService.getUnfilledMandatoryFormElements(form, RequestUtil.fromObservationRequests(individualRequest.getObservations()));
        if (unfilledMandatoryFormElements.size() != 0) {
            throw new RuntimeException(String.format("Mandatory form-elements not present: %s", Arrays.toString(unfilledMandatoryFormElements.toArray())));
        }
        validateObservations(individualRequest.getObservations(), form);
        individualController.save(individualRequest);
        logger.info(String.format("Imported Individual: %s", individualRequest.getUuid()));
    }

    private void validateObservations(List<ObservationRequest> observationRequests, Form form) {
        observationRequests.forEach(observationRequest -> {
            FormElement formElement = form.findFormElement(observationRequest.getConceptName());
            if (formElement.isMandatory()) throw new RuntimeException(String.format("%s is mandatory but was empty", observationRequest.getConceptName()));
        });
    }

    void processEnrolment(ProgramEnrolmentRequest programEnrolmentRequest, ImportSheetMetaData sheetMetaData, ProgramEnrolmentModuleInvoker programEnrolmentModuleInvoker) {
        Form form = formService.findForm(FormType.ProgramEnrolment, null, sheetMetaData.getProgramName());
        validateObservations(programEnrolmentRequest.getObservations(), form);
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
        logger.info(String.format("Imported Enrolment for Program: %s, Enrolment: %s", programEnrolmentRequest.getProgram(), programEnrolmentRequest.getUuid()));
    }

    void processProgramEncounter(ProgramEncounterRequest programEncounterRequest, ImportSheetMetaData sheetMetaData, ProgramEncounterRuleInvoker ruleInvoker) {
        Form form = formService.findForm(FormType.ProgramEncounter, sheetMetaData.getEncounterType(), sheetMetaData.getProgramName());
        validateObservations(programEncounterRequest.getObservations(), form);
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
        logger.info(String.format("Imported ProgramEncounter for Enrolment: %s", programEncounterRequest.getProgramEnrolmentUUID()));
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