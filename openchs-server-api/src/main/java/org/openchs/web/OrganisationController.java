package org.openchs.web;

import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.Organisation;
import org.openchs.web.request.OrganisationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.UUID;

@RestController
public class OrganisationController implements RestControllerResourceProcessor<Organisation> {

    private OrganisationRepository organisationRepository;

    @Autowired
    public OrganisationController(OrganisationRepository organisationRepository) {
        this.organisationRepository = organisationRepository;
    }

    @RequestMapping(value = "/organisation", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public ResponseEntity save(@RequestBody OrganisationRequest request) {
//        todo: generate random password and send it as response.
        String tempPassword = "password";
        Organisation org = organisationRepository.findByUuid(request.getUuid());
        organisationRepository.createDBUser(request.getDbUser(), tempPassword);
        if (org == null) {
            org = new Organisation();
        }
        org.setUuid(request.getUuid() == null ? UUID.randomUUID().toString() : request.getUuid());
        org.setName(request.getName());
        org.setDbUser(request.getDbUser());
        org.setUsernameSuffix(request.getUsernameSuffix());
        Organisation parentOrg = organisationRepository.findByUuid(request.getParentUuid());
        if (parentOrg != null) {
            org.setParentOrganisationId(parentOrg.getId());
        }
        org.setMediaDirectory(request.getMediaDirectory());
        org.setVoided(request.isVoided());
        organisationRepository.save(org);
        return new ResponseEntity<>(org, HttpStatus.CREATED);
    }
}
