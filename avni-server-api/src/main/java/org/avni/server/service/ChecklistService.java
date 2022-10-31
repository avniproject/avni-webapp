package org.avni.server.service;


import org.avni.server.dao.*;
import org.avni.server.domain.*;
import org.avni.server.framework.security.UserContextHolder;
import org.joda.time.DateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;
import java.util.Set;

@Component
public class ChecklistService implements ScopeAwareService {
    private ChecklistRepository checklistRepository;
    private ChecklistItemRepository checklistItemRepository;
    private final ChecklistDetailRepository checklistDetailRepository;

    @Autowired
    public ChecklistService(ChecklistRepository checklistRepository, ChecklistItemRepository checklistItemRepository, ProgramEnrolmentRepository programEnrolmentRepository, ChecklistDetailRepository checklistDetailRepository) {
        this.checklistRepository = checklistRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.checklistDetailRepository = checklistDetailRepository;
    }

    public Set<Checklist> findChecklistsByIndividual(Individual individual) {
        return checklistRepository.findByProgramEnrolmentIndividual(individual);
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public ChecklistItem findChecklistItem(String checklistUUID, String checklistItemDetailUUID) {
        return checklistItemRepository.findByChecklistUuidAndChecklistItemDetailUuid(checklistUUID, checklistItemDetailUUID);
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public void saveItem(ChecklistItem checklistItem) {
        checklistItemRepository.save(checklistItem);
    }

    @Override
    public boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String checklistDetailUuid) {
        ChecklistDetail checklistDetail = checklistDetailRepository.findByUuid(checklistDetailUuid);
        User user = UserContextHolder.getUserContext().getUser();
        Checklist checklist = checklistRepository.findFirstByChecklistDetail(checklistDetail);
        return checklistDetail != null &&
                checklist != null &&
                isChangedBySubjectTypeRegistrationLocationType(user, lastModifiedDateTime, checklistDetail.getId(), checklist.getProgramEnrolment().getIndividual().getSubjectType(), SyncParameters.SyncEntityName.Checklist);
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return checklistRepository;
    }
}
