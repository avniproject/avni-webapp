package org.avni.server.web;

import org.avni.server.domain.Organisation;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.SubjectTypeService;
import org.avni.server.web.request.OperationalSubjectTypesContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class OperationalSubjectTypesController {
    private final SubjectTypeService subjectTypeService;

    @Autowired
    public OperationalSubjectTypesController(SubjectTypeService subjectTypeService) {
        this.subjectTypeService = subjectTypeService;
    }

    @RequestMapping(value = "/operationalSubjectTypes", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    void saveOperationalSubjectTypes(@RequestBody OperationalSubjectTypesContract request) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        request.getOperationalSubjectTypes().forEach(operationalSubjectTypeContract -> {
            subjectTypeService.createOperationalSubjectType(operationalSubjectTypeContract, organisation);
        });
    }
}
