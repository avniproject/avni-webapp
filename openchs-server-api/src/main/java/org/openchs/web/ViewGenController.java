package org.openchs.web;

import org.openchs.reporting.ViewGenService;
import org.openchs.web.request.ViewConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

import static org.openchs.web.request.ViewConfig.Type.*;

@RestController
public class ViewGenController {
    @Autowired
    ViewGenService viewGenService;

    @PostMapping(value = "/query")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public Map<String, String> query(@RequestBody ViewConfig viewConfig) {
        if (Registration.equals(viewConfig.getType())) {
            return viewGenService.registrationReport(viewConfig.getSpreadMultiSelectObs());
        }
        if (ProgramEncounter.equals(viewConfig.getType())) {
            return viewGenService.getSqlsFor(viewConfig.getProgram(), viewConfig.getEncounterType(), viewConfig.getSpreadMultiSelectObs());
        }
        return new HashMap<>();
    }
}
