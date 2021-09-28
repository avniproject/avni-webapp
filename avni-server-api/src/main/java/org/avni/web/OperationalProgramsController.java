package org.avni.web;

import org.avni.domain.Organisation;
import org.avni.framework.security.UserContextHolder;
import org.avni.service.ProgramService;
import org.avni.web.request.OperationalProgramsContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class OperationalProgramsController {

    private final ProgramService programService;

    @Autowired
    public OperationalProgramsController(ProgramService programService) {
        this.programService = programService;
    }

    @RequestMapping(value = "/operationalPrograms", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    void saveOperationalPrograms(@RequestBody OperationalProgramsContract request) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        request.getOperationalPrograms().forEach(operationalProgramContract -> {
            programService.createOperationalProgram(operationalProgramContract, organisation);
        });
    }
}
