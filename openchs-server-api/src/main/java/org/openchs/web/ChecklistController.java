package org.openchs.web;

import org.openchs.dao.*;
import org.openchs.domain.Checklist;
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
    private final ChecklistDetailRepository checklistDetailRepository;
    private ChecklistRepository checklistRepository;
    private ProgramEnrolmentRepository programEnrolmentRepository;

    @Autowired
    public ChecklistController(ChecklistRepository checklistRepository,
                               ProgramEnrolmentRepository programEnrolmentRepository,
                               ChecklistDetailRepository checklistDetailRepository) {
        this.checklistDetailRepository = checklistDetailRepository;
        this.checklistRepository = checklistRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
    }

    @Transactional
    @RequestMapping(value = "/txNewChecklistEntitys", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public void save(@RequestBody ChecklistRequest checklistRequest) {
        Checklist checklist = newOrExistingEntity(checklistRepository, checklistRequest, new Checklist());
        checklist.setChecklistDetail(this.checklistDetailRepository.findByUuid(checklistRequest.getChecklistDetailUUID()));
        checklist.setProgramEnrolment(programEnrolmentRepository.findByUuid(checklistRequest.getProgramEnrolmentUUID()));
        checklist.setBaseDate(checklistRequest.getBaseDate());
        checklistRepository.save(checklist);
    }

    @Transactional
    @RequestMapping(value = "/checklists", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public void save(@RequestBody Object object) {

    }
}