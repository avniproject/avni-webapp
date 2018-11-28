package org.openchs.web;

import org.openchs.builder.ChecklistDetailBuilder;
import org.openchs.dao.ChecklistDetailRepository;
import org.openchs.dao.ChecklistItemDetailRepository;
import org.openchs.domain.ChecklistDetail;
import org.openchs.web.request.application.ChecklistDetailRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class ChecklistDetailController {
    private final ChecklistDetailRepository checklistDetailRepository;
    private static Logger logger = LoggerFactory.getLogger(ChecklistDetailController.class);

    @Autowired
    public ChecklistDetailController(ChecklistDetailRepository checklistDetailRepository) {
        this.checklistDetailRepository = checklistDetailRepository;
    }

    @RequestMapping(value = "/checklistDetail", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> save(@RequestBody ChecklistDetailRequest checklistDetail) {
        logger.info(String.format("Saving checklist detail: %s, with UUID: %s", checklistDetail.getName(), checklistDetail.getUuid()));
        ChecklistDetail checklist = checklistDetailRepository.findByUuid(checklistDetail.getUuid());
        checklist = new ChecklistDetailBuilder(checklist)
                .withItems(checklistDetail.getItems())
                .withName(checklistDetail.getName())
                .withUUID(checklistDetail.getUuid())
                .withVoided(checklistDetail.isVoided())
                .build();
        checklistDetailRepository.save(checklist);
        return new ResponseEntity<>("Created", HttpStatus.CREATED);
    }

}
