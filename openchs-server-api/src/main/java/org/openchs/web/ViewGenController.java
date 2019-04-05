package org.openchs.web;

import org.openchs.reporting.SqlGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ViewGenController {
    @Autowired
    SqlGenerationService sqlGenerationService;

    @RequestMapping(value = "/query/program/{programName}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public Map<String, String> query(@PathVariable("programName") String programName) {
        return sqlGenerationService.getSqlsFor(programName, null);
    }

    @RequestMapping(value = "/query/program/{programName}/encounter/{encounterType}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public Map<String, String> query(@PathVariable("programName") String programName,
                                     @PathVariable("encounterType") String encounterType) {
        return sqlGenerationService.getSqlsFor(programName, encounterType);
    }

    @RequestMapping(value = "/query/registration", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public String query() {
        return sqlGenerationService.registrationReport();
    }

}
