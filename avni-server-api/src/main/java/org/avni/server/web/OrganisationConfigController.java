package org.avni.server.web;


import org.avni.server.domain.JsonObject;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.OrganisationConfig;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.OrganisationConfigService;
import org.avni.server.web.request.OrganisationConfigRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

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

    @RequestMapping(value = "/organisationConfig", method = RequestMethod.PUT)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity update(@RequestBody OrganisationConfigRequest request) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        OrganisationConfig organisationConfig = organisationConfigService.getOrganisationConfig(organisation);
        if (organisationConfig == null ) {
            return save(request);
        } else {
            try {
                organisationConfigService.updateOrganisationConfig(request, organisationConfig);
                return new ResponseEntity<>(organisationConfig, HttpStatus.OK);
            } catch(Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        }
    }

    @RequestMapping(value = "/organisationConfig/exportSettings", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public JsonObject getExportSettings() {
        return organisationConfigService.getExportSettings();
    }

    @RequestMapping(value = "/organisationConfig/exportSettings", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> saveNewExportSettings(@RequestParam(value = "name") String name, @RequestBody JsonObject request) {
        return organisationConfigService.saveNewExportSettings(name, request);
    }

    @RequestMapping(value = "/organisationConfig/exportSettings", method = RequestMethod.PUT)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> updateExistingExportSettings(@RequestParam(value = "name") String name, @RequestBody JsonObject request) {
        return organisationConfigService.updateExistingExportSettings(name, request);
    }

    @RequestMapping(value = "/organisationConfig/exportSettings", method = RequestMethod.DELETE)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> deleteExportSettings(@RequestParam(value = "name") String name) {
        return organisationConfigService.deleteExportSettings(name);
    }
}
