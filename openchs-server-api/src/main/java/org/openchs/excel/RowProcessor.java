package org.openchs.excel;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.DateTime;
import org.openchs.dao.ChecklistRepository;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.ChecklistItem;
import org.openchs.domain.ProgramEncounter;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.service.ChecklistService;
import org.openchs.service.FormService;
import org.openchs.service.ObservationService;
import org.openchs.service.ProgramEnrolmentService;
import org.openchs.web.*;
import org.openchs.web.request.IndividualRequest;
import org.openchs.web.request.ProgramEncounterRequest;
import org.openchs.web.request.ProgramEnrolmentRequest;
import org.openchs.web.request.application.ChecklistItemRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

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
        individualController.save(individualRequest);
        logger.info(String.format("Imported Individual: %s", individualRequest.getUuid()));
    }

    void processEnrolment(ProgramEnrolmentRequest programEnrolmentRequest, ImportSheetMetaData sheetMetaData) {
        programEnrolmentController.save(programEnrolmentRequest);

        logger.info(String.format("Imported Enrolment for Program: %s, Enrolment: %s", programEnrolmentRequest.getProgram(), programEnrolmentRequest.getUuid()));
    }

    void processProgramEncounter(ProgramEncounterRequest programEncounterRequest, ImportSheetMetaData sheetMetaData) {
        ProgramEncounter programEncounter = matchAndUseExistingProgramEncounter(programEncounterRequest);
        if (programEncounter == null)
            programEncounterRequest.setupUuidIfNeeded();
        else
            programEncounterRequest.setUuid(programEncounter.getUuid());

        programEncounterController.save(programEncounterRequest);
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