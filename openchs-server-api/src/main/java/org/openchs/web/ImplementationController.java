package org.openchs.web;

import org.openchs.domain.Concept;
import org.openchs.domain.Organisation;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.ImplementationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.ZipOutputStream;

@RestController
public class ImplementationController implements RestControllerResourceProcessor<Concept> {

    private final ImplementationService implementationService;

    @Autowired
    public ImplementationController(ImplementationService implementationService) {
        this.implementationService = implementationService;
    }

    @RequestMapping(value = "/implementation/export/{includeLocations}", method = RequestMethod.GET)
    @PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity<ByteArrayResource> export(@PathVariable boolean includeLocations) throws IOException {

        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        Long orgId = organisation.getId();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        //ZipOutputStream will be automatically closed because we are using try-with-resources.
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            if (includeLocations) {
                implementationService.addAddressLevelTypesJson(orgId, zos);
                implementationService.addAddressLevelsJson(orgId, zos);
                implementationService.addCatchmentsJson(organisation, zos);
            }
            implementationService.addSubjectTypesJson(orgId, zos);
            implementationService.addOperationalSubjectTypesJson(organisation, zos);
            implementationService.addEncounterTypesJson(organisation, zos);
            implementationService.addOperationalEncounterTypesJson(organisation, zos);
            implementationService.addProgramsJson(organisation, zos);
            implementationService.addOperationalProgramsJson(organisation, zos);
            implementationService.addConceptsJson(orgId, zos);
            implementationService.addFormsJson(orgId, zos);
            implementationService.addFormMappingsJson(orgId, zos);
            implementationService.addOrganisationConfigJson(orgId, zos);
            //Id source is mapped to a catchment so if includeLocations is false we don't add those sources to json
            implementationService.addIdentifierSourceJson(zos, includeLocations);
            implementationService.addRelationJson(zos);
            implementationService.addRelationShipTypeJson(zos);
            implementationService.addChecklistDetailJson(zos);
            implementationService.addGroupsJson(zos);
            implementationService.addGroupRoleJson(zos);
            implementationService.addGroupPrivilegeJson(zos);
        }

        byte[] baosByteArray = baos.toByteArray();

        return ResponseEntity.ok()
                .headers(getHttpHeaders())
                .contentLength(baosByteArray.length)
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(new ByteArrayResource(baosByteArray));

    }

    private HttpHeaders getHttpHeaders() {
        HttpHeaders header = new HttpHeaders();
        header.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=impl.zip");
        header.add("Cache-Control", "no-cache, no-store, must-revalidate");
        header.add("Pragma", "no-cache");
        header.add("Expires", "0");
        return header;
    }
}
