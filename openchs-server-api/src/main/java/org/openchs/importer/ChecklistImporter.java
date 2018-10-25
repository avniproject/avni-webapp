package org.openchs.importer;

import org.apache.poi.ss.usermodel.Row;
import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.domain.*;
import org.openchs.excel.ImportSheetHeader;
import org.openchs.excel.metadata.ImportAnswerMetaDataList;
import org.openchs.excel.metadata.ImportCalculatedFields;
import org.openchs.excel.metadata.ImportField;
import org.openchs.excel.metadata.ImportSheetMetaData;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.ChecklistService;
import org.openchs.web.ChecklistController;
import org.openchs.web.ChecklistItemController;
import org.openchs.web.request.ChecklistRequest;
import org.openchs.web.request.ObservationRequest;
import org.openchs.web.request.application.ChecklistItemRequest;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class ChecklistImporter extends Importer<ChecklistRequest> {

    private final ChecklistDetailRepository checklistDetailRepository;
    private final ChecklistItemDetailRepository checklistItemDetailRepository;
    private final ChecklistRepository checklistRepository;
    private final ChecklistController checklistController;
    private final ChecklistItemController checklistItemController;
    private final ChecklistService checklistService;

    public ChecklistImporter(ConceptRepository conceptRepository, FormElementRepository formElementRepository,
                             ChecklistDetailRepository checklistDetailRepository,
                             ChecklistItemDetailRepository checklistItemDetailRepository,
                             ChecklistRepository checklistRepository,
                             ChecklistController checklistController,
                             ChecklistItemController checklistItemController, ChecklistService checklistService,
                             UserRepository userRepository) {
        super(conceptRepository, formElementRepository, userRepository);
        this.checklistDetailRepository = checklistDetailRepository;
        this.checklistItemDetailRepository = checklistItemDetailRepository;
        this.checklistRepository = checklistRepository;
        this.checklistController = checklistController;
        this.checklistItemController = checklistItemController;
        this.checklistService = checklistService;
        this.inParallel = true;
    }

    @Override
    protected Boolean processRequest(ChecklistRequest checklistRequest) {
        saveChecklist(checklistRequest);
        checklistRequest.getChecklistItemRequestList().forEach(checklistItemRequest -> {
            ChecklistItem existingChecklistItem = checklistService
                    .findChecklistItem(checklistRequest.getUuid(), checklistItemRequest.getChecklistItemDetailUUID());
            if (existingChecklistItem != null) {
                checklistItemRequest.setUuid(existingChecklistItem.getUuid());
            }
            checklistItemController.save(checklistItemRequest);
        });
        return true;
    }

    private void saveChecklist(ChecklistRequest checklistRequest) {
        String checklistName = checklistRequest.getName();
        ChecklistDetail checklistDetail = this.checklistDetailRepository.findByName(checklistName);
        if(checklistDetail != null) {
            logger.info(String.format("Checklist Detail: %s", checklistDetail.getUuid()));
            checklistRequest.setChecklistDetailUUID(checklistDetail.getUuid());
        } else {
            logger.error(String.format("Checklist Detail By Name %s not found", checklistName));
            throw new NullPointerException(String.format("Checklist Detail By Name %s not found", checklistName));
        }

        synchronized (checklistRequest.getProgramEnrolmentUUID().intern()) {
            Checklist existingChecklist = checklistRepository.findByProgramEnrolmentUuidAndChecklistDetailName(checklistRequest.getProgramEnrolmentUUID(), checklistName);
            if (existingChecklist != null) {
                checklistRequest.setUuid(existingChecklist.getUuid());
            }
            checklistRequest.setupUuidIfNeeded();
            checklistRequest.getChecklistItemRequestList().forEach(item-> item.setChecklistUUID(checklistRequest.getUuid()));
            this.checklistController.save(checklistRequest);
        }
    }

    @Override
    protected ChecklistRequest makeRequest(List<ImportField> allFields, ImportSheetHeader header, ImportSheetMetaData importSheetMetaData, Row row, ImportAnswerMetaDataList answerMetaDataList, ImportCalculatedFields calculatedFields) {
        ChecklistRequest checklistRequest = new ChecklistRequest();
        ChecklistItemRequest checklistItemRequest = new ChecklistItemRequest();
        allFields.forEach(importField -> {
            String systemFieldName = importField.getSystemFieldName();
            switch (systemFieldName) {
                case "Enrolment UUID":
                    String enrolmentUUID = importField.getTextValue(row, header, importSheetMetaData);
                    logger.info(String.format("Enrolment UUID: %s", enrolmentUUID));
                    checklistRequest.setProgramEnrolmentUUID(enrolmentUUID);
                    break;
                case "Base Date":
                    checklistRequest.setBaseDate(new DateTime(importField.getDateValue(row, header, importSheetMetaData)));
                    break;
                case "Checklist Name":
                    String checklistName = importField.getTextValue(row, header, importSheetMetaData);
                    logger.info(String.format("Checklist Name: %s", checklistName));
                    checklistRequest.setName(checklistName);
                    break;
                case "Item Name":
                    String checklistItemName = importField.getTextValue(row, header, importSheetMetaData);
                    ChecklistItemDetail checklistItemDetail = checklistItemDetailRepository.findByConceptNameIgnoreCase(checklistItemName);
                    if (checklistItemDetail != null) {
                        logger.info(String.format("Checklist Item Detail: %s", checklistItemDetail.getUuid()));
                        checklistItemRequest.setChecklistItemDetailUUID(checklistItemDetail.getUuid());
                    } else {
                        logger.error(String.format("Checklist Item Detail By Name %s not found", checklistItemName));
                        throw new NullPointerException(String.format("Checklist Item Detail By Name %s not found", checklistItemName));
                    }
                    break;
                case "Completion Date":
                    checklistItemRequest.setCompletionDate(new DateTime(importField.getDateValue(row, header, importSheetMetaData)));
                    break;
                case "User":
                    setUser(header, importSheetMetaData, row, importField);
                    break;
                default:
                    ObservationRequest observationRequest = null;
                    try {
                        observationRequest = createObservationRequest(row, header, importSheetMetaData, importField, systemFieldName, answerMetaDataList, calculatedFields, checklistItemRequest.getCompletionDate().toDate());
                    } catch (Exception e) { // let record import continue even if observation fails
                        logger.error(String.format("Failed to create observation '%s' in row '%d' with error %s", systemFieldName, row.getRowNum(), e.getMessage()));
                    }
                    if (observationRequest == null) break;
                    List<ObservationRequest> observations = checklistItemRequest.getObservations();
                    this.mergeObservations(observations, observationRequest);
                    checklistItemRequest.setObservations(observations);
                    break;
            }
        });
        checklistRequest.setChecklistItemRequestList(Arrays.asList(checklistItemRequest));
        checklistItemRequest.setupUuidIfNeeded();
        return checklistRequest;
    }

}
