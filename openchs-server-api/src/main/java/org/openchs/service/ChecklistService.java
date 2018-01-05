package org.openchs.service;

import org.openchs.dao.ChecklistItemRepository;
import org.openchs.dao.ChecklistRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.Checklist;
import org.openchs.domain.ChecklistItem;
import org.openchs.domain.ProgramEnrolment;
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
    public ChecklistItem findChecklistItem(String programEnrolmentUUID, String checklistItemName) {
        Checklist checklist = this.findChecklist(programEnrolmentUUID);
        if (checklist == null) return null;

        return checklist.getItems()
                .stream()
                .filter(x -> x.getConcept().getName().equals(checklistItemName))
                .findFirst()
                .orElse(null);
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public void saveItem(ChecklistItem checklistItem) {
        checklistItemRepository.save(checklistItem);
    }
}