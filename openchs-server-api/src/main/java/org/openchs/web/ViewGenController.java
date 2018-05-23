package org.openchs.web;

import org.openchs.reporting.SqlGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URISyntaxException;

@RestController
public class ViewGenController {
    @Autowired
    SqlGenerationService sqlGenerationService;

    @RequestMapping(value = "/query/{programName}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin', 'organisation_admin')")
    public String query(@PathVariable("programName") String programName) throws IOException, URISyntaxException {
        return sqlGenerationService.getSqlFor(StringUtils.capitalize(programName.toLowerCase()));
    }
}
