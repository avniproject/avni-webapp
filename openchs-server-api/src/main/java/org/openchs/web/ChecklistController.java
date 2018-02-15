package org.openchs.web;

import org.openchs.dao.ChecklistRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.Checklist;
import org.openchs.util.LockProvider;
import org.openchs.web.request.ChecklistRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class ChecklistController extends AbstractController<Checklist> {
    private ChecklistRepository checklistRepository;
    private ProgramEnrolmentRepository programEnrolmentRepository;

    @Autowired
    public ChecklistController(ChecklistRepository checklistRepository, ProgramEnrolmentRepository programEnrolmentRepository) {
        this.checklistRepository = checklistRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
    }

    @Transactional
    @RequestMapping(value = "/checklists", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public void save(@RequestBody ChecklistRequest checklistRequest) {
        synchronized (LockProvider.getLockObject(this)) {
            saveInternal(checklistRequest);
        }
    }

    private void saveInternal(ChecklistRequest checklistRequest) {
        Checklist checklist = newOrExistingEntity(checklistRepository, checklistRequest, new Checklist());
        checklist.setName(checklistRequest.getName());
        checklist.setProgramEnrolment(programEnrolmentRepository.findByUuid(checklistRequest.getProgramEnrolmentUUID()));
        checklist.setBaseDate(checklistRequest.getBaseDate());
        checklistRepository.save(checklist);
    }
}