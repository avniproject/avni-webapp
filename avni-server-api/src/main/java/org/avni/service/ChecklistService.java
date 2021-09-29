package org.avni.service;

import org.avni.dao.*;
import org.avni.domain.*;

import org.avni.framework.security.UserContextHolder;
import org.joda.time.DateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;

@Component
public class ChecklistService implements ScopeAwareService {
    private ChecklistRepository checklistRepository;
    private ChecklistItemRepository checklistItemRepository;
    private ProgramEnrolmentRepository programEnrolmentRepository;
    private final ChecklistDetailRepository checklistDetailRepository;

    @Autowired
    public ChecklistService(ChecklistRepository checklistRepository, ChecklistItemRepository checklistItemRepository, ProgramEnrolmentRepository programEnrolmentRepository, ChecklistDetailRepository checklistDetailRepository) {
        this.checklistRepository = checklistRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.checklistDetailRepository = checklistDetailRepository;
    }

    public Checklist findChecklist(String programEnrolmentUUID) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(programEnrolmentUUID);
        if (programEnrolment == null)
            return null;

        return checklistRepository.findByProgramEnrolmentId(programEnrolment.getId());
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
        return checklistDetail != null && isChanged(user, lastModifiedDateTime, checklistDetail.getId());
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return checklistRepository;
    }
}
