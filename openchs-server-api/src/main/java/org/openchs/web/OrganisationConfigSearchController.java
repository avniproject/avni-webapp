package org.openchs.web;

import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.AddressLevelService;
import org.openchs.service.OrganisationConfigService;
import org.openchs.web.request.AddressLevelContract;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.LinkedHashMap;
import java.util.List;

@RestController
public class OrganisationConfigSearchController {

    private final OrganisationConfigService organisationConfigService;
    private final Logger logger;
    private final AddressLevelService addressLevelService;

    @Autowired
    public OrganisationConfigSearchController(OrganisationConfigService organisationConfigService, AddressLevelService addressLevelService) {
        this.organisationConfigService = organisationConfigService;
        logger = LoggerFactory.getLogger(this.getClass());
        this.addressLevelService=addressLevelService;
    }

    @GetMapping(value = "/web/organisationConfig")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin', 'admin')")
    @ResponseBody
    public ResponseEntity<LinkedHashMap<String, Object>> getOrganisationSearchConfig()  {
        Long organisationId = UserContextHolder.getUserContext().getOrganisation().getId();
        try{
            return new ResponseEntity<>( organisationConfigService.getOrganisationSettings(organisationId), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
        }
        return ResponseEntity.status(500).build();
    }

    @GetMapping(value = "/web/locations")
    @PreAuthorize(value = "hasAnyAuthority('user','admin','organisation_admin')")
    @ResponseBody
    public ResponseEntity<List<AddressLevelContract>> getAll() {
        return new ResponseEntity(addressLevelService.getAllLocations(),HttpStatus.OK) ;
    }
}
