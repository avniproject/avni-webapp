package org.avni.service;

import org.avni.dao.ChecklistItemRepository;
import org.avni.dao.ChecklistRepository;
import org.avni.dao.ProgramEnrolmentRepository;
import org.avni.domain.Checklist;
import org.avni.domain.ChecklistItem;
import org.avni.domain.ProgramEnrolment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;

@Component
public class ChecklistService {
    private ChecklistRepository checklistRepository;
    private ChecklistItemRepository checklistItemRepository;
    private ProgramEnrolmentRepository programEnrolmentRepository;

    @Autowired
    public ChecklistService(ChecklistRepository checklistRepository, ChecklistItemRepository checklistItemRepository, ProgramEnrolmentRepository programEnrolmentRepository) {
        this.checklistRepository = checklistRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
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
}
