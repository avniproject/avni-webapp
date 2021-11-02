package org.avni.service;

import org.avni.dao.GroupSubjectRepository;
import org.avni.dao.IndividualRepository;
import org.avni.domain.GroupSubject;
import org.avni.domain.Individual;
import org.avni.web.response.SyncSubjectResponse;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubjectSyncResponseBuilderService {
    private IndividualRepository individualRepository;
    private ChecklistService checklistService;
    private ChecklistItemService checklistItemService;
    private IndividualRelationshipService individualRelationshipService;
    private GroupSubjectRepository groupSubjectRepository;
    private GroupPrivilegeService privilegeService;

    public SubjectSyncResponseBuilderService(IndividualRepository individualRepository, ChecklistService checklistService,
                                             ChecklistItemService checklistItemService,
                                             IndividualRelationshipService individualRelationshipService,
                                             GroupSubjectRepository groupSubjectRepository,
                                             GroupPrivilegeService privilegeService) {
        this.individualRepository = individualRepository;
        this.checklistService = checklistService;
        this.checklistItemService = checklistItemService;
        this.individualRelationshipService = individualRelationshipService;
        this.groupSubjectRepository = groupSubjectRepository;
        this.privilegeService = privilegeService;
    }

    public SyncSubjectResponse getSubject(String uuid) {
        SyncSubjectResponse syncSubjectResponse = new SyncSubjectResponse();
        Individual individual = individualRepository.findByUuid(uuid);
        syncSubjectResponse.setIndividual(individual);
        syncSubjectResponse.setProgramEnrolments(individual.getProgramEnrolments()
                .stream()
                .filter(programEnrolment ->
                        privilegeService.hasViewPrivilege(programEnrolment))
                .collect(Collectors.toSet()));

        syncSubjectResponse.setProgramEncounters(individual.getProgramEncounters()
                .stream()
                .filter(programEncounter ->
                        privilegeService.hasViewPrivilege(programEncounter))
                .collect(Collectors.toSet()));

        syncSubjectResponse.setEncounters(individual.getEncounters()
                .stream()
                .filter(encounter ->
                        privilegeService.hasViewPrivilege(encounter))
                .collect(Collectors.toSet()));

        syncSubjectResponse.setChecklists(checklistService.findChecklistsByIndividual(individual)
                .stream()
                .filter(checklist ->
                        privilegeService.hasViewPrivilege(checklist))
                .collect(Collectors.toSet()));

        syncSubjectResponse.setChecklistItems(checklistItemService.findChecklistItemsByIndividual(individual)
                .stream()
                .filter(checklistItem ->
                        privilegeService.hasViewPrivilege(checklistItem))
                .collect(Collectors.toSet()));

        syncSubjectResponse.setIndividualRelationships(individualRelationshipService.findByIndividual(individual)
                .stream()
                .filter(individualRelationship ->
                        privilegeService.hasViewPrivilege(individualRelationship.getIndividuala()) &&
                                privilegeService.hasViewPrivilege(individualRelationship.getIndividualB())
                )
                .collect(Collectors.toSet()));
        List<GroupSubject> groupSubjects = groupSubjectRepository.findAllByGroupSubjectOrMemberSubject(individual, individual);
        syncSubjectResponse.setGroupSubjects(groupSubjects
                .stream()
                .filter(groupSubject ->
                        privilegeService.hasViewPrivilege(groupSubject.getGroupSubject()) &&
                                privilegeService.hasViewPrivilege(groupSubject.getMemberSubject())
                )
                .collect(Collectors.toSet()));

        return syncSubjectResponse;
    }
}
