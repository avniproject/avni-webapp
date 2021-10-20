package org.avni.service;

import org.avni.dao.IndividualRepository;
import org.avni.domain.Individual;
import org.avni.web.response.SyncSubjectResponse;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
@Transactional
public class SubjectSyncResponseBuilderService {
    private IndividualRepository individualRepository;
    private ChecklistService checklistService;
    private ChecklistItemService checklistItemService;
    private IndividualRelationshipService individualRelationshipService;

    public SubjectSyncResponseBuilderService(IndividualRepository individualRepository, ChecklistService checklistService,
                                             ChecklistItemService checklistItemService, IndividualRelationshipService individualRelationshipService) {
        this.individualRepository = individualRepository;
        this.checklistService = checklistService;
        this.checklistItemService = checklistItemService;
        this.individualRelationshipService = individualRelationshipService;
    }

    public SyncSubjectResponse getSubject(String uuid) {
        SyncSubjectResponse syncSubjectResponse = new SyncSubjectResponse();
        Individual individual = individualRepository.findByUuid(uuid);
        syncSubjectResponse.setIndividual(individual);
        syncSubjectResponse.setProgramEnrolments(individual.getProgramEnrolments());
        syncSubjectResponse.setProgramEncounters(individual.getProgramEncounters());
        syncSubjectResponse.setEncounters(individual.getEncounters());
        syncSubjectResponse.setChecklists(checklistService.findChecklistsByIndividual(individual));
        syncSubjectResponse.setChecklistItems(checklistItemService.findChecklistItemsByIndividual(individual));
        syncSubjectResponse.setIndividualRelationships(individualRelationshipService.findByIndividual(individual));

        return syncSubjectResponse;
    }
}
