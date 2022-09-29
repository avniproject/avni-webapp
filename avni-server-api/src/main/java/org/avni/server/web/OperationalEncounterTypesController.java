package org.avni.server.web;

import org.avni.server.domain.Organisation;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.EncounterTypeService;
import org.avni.server.web.request.OperationalEncounterTypesContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class OperationalEncounterTypesController {
    private final EncounterTypeService encounterTypeService;

    @Autowired
    public OperationalEncounterTypesController(EncounterTypeService encounterTypeService) {
        this.encounterTypeService = encounterTypeService;
    }

    @RequestMapping(value = "/operationalEncounterTypes", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    void saveOperationalEncounterTypes(@RequestBody OperationalEncounterTypesContract request) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        request.getOperationalEncounterTypes().forEach(operationalEncounterTypeContract -> {
            encounterTypeService.createOperationalEncounterType(operationalEncounterTypeContract, organisation);
        });
    }
}
