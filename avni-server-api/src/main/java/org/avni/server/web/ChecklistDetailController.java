package org.avni.server.web;

import org.avni.server.service.ChecklistDetailService;
import org.avni.server.web.request.application.ChecklistDetailRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class ChecklistDetailController {
    private final ChecklistDetailService checklistDetailService;

    @Autowired
    public ChecklistDetailController(ChecklistDetailService checklistDetailService) {
        this.checklistDetailService = checklistDetailService;
    }

    @RequestMapping(value = "/checklistDetail", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> save(@RequestBody ChecklistDetailRequest checklistDetail) {
        checklistDetailService.saveChecklist(checklistDetail);
        return new ResponseEntity<>("Created", HttpStatus.CREATED);
    }

    @RequestMapping(value = "/web/checklistDetails", method = RequestMethod.GET)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public List<ChecklistDetailRequest> getChecklistDetails() {
        return checklistDetailService.getAllChecklistDetail();
    }

}
