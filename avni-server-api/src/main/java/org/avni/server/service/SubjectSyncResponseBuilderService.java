package org.avni.server.service;

import org.avni.server.dao.GroupSubjectRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.domain.GroupPrivileges;
import org.avni.server.domain.GroupSubject;
import org.avni.server.domain.Individual;
import org.avni.server.web.response.SyncSubjectResponse;
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
        GroupPrivileges groupPrivileges = privilegeService.getGroupPrivileges();

        SyncSubjectResponse syncSubjectResponse = new SyncSubjectResponse();
        Individual individual = individualRepository.findByUuid(uuid);
        syncSubjectResponse.setIndividual(individual);
        syncSubjectResponse.setProgramEnrolments(individual.getProgramEnrolments()
                .stream()
                .filter(programEnrolment ->
                        groupPrivileges.hasViewPrivilege(programEnrolment))
                .collect(Collectors.toSet()));

        syncSubjectResponse.setProgramEncounters(individual.getProgramEncounters()
                .stream()
                .filter(programEncounter ->
                        groupPrivileges.hasViewPrivilege(programEncounter))
                .collect(Collectors.toSet()));

        syncSubjectResponse.setEncounters(individual.getEncounters()
                .stream()
                .filter(encounter ->
                        groupPrivileges.hasViewPrivilege(encounter))
                .collect(Collectors.toSet()));

        syncSubjectResponse.setChecklists(checklistService.findChecklistsByIndividual(individual)
                .stream()
                .filter(checklist ->
                        groupPrivileges.hasViewPrivilege(checklist))
                .collect(Collectors.toSet()));

        syncSubjectResponse.setChecklistItems(checklistItemService.findChecklistItemsByIndividual(individual)
                .stream()
                .filter(checklistItem ->
                        groupPrivileges.hasViewPrivilege(checklistItem))
                .collect(Collectors.toSet()));

        syncSubjectResponse.setIndividualRelationships(individualRelationshipService.findByIndividual(individual)
                .stream()
                .filter(individualRelationship ->
                        groupPrivileges.hasViewPrivilege(individualRelationship.getIndividuala()) &&
                                groupPrivileges.hasViewPrivilege(individualRelationship.getIndividualB())
                )
                .collect(Collectors.toSet()));
        List<GroupSubject> groupSubjects = groupSubjectRepository.findAllByGroupSubjectOrMemberSubject(individual);
        syncSubjectResponse.setGroupSubjects(groupSubjects
                .stream()
                .filter(groupSubject ->
                        groupPrivileges.hasViewPrivilege(groupSubject.getGroupSubject()) &&
                                groupPrivileges.hasViewPrivilege(groupSubject.getMemberSubject())
                )
                .collect(Collectors.toSet()));

        return syncSubjectResponse;
    }
}
