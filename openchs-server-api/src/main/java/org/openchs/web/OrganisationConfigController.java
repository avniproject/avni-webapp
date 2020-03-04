package org.openchs.web;

import org.openchs.domain.Organisation;
import org.openchs.domain.OrganisationConfig;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.OrganisationConfigService;
import org.openchs.web.request.OrganisationConfigRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.transaction.Transactional;

@RepositoryRestController
public class OrganisationConfigController implements RestControllerResourceProcessor<OrganisationConfig> {
    private final OrganisationConfigService organisationConfigService;

    @Autowired
    public OrganisationConfigController(OrganisationConfigService organisationConfigService) {
        this.organisationConfigService = organisationConfigService;
    }

    @RequestMapping(value = "/organisationConfig", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity save(@RequestBody OrganisationConfigRequest request) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        OrganisationConfig organisationConfig = organisationConfigService.saveOrganisationConfig(request, organisation);
        return new ResponseEntity<>(organisationConfig, HttpStatus.CREATED);
    }

}
