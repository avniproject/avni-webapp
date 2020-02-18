package org.openchs.service;

import org.openchs.dao.OrganisationConfigRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.OrganisationConfig;
import org.openchs.web.request.OrganisationConfigRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class OrganisationConfigService {

    private final OrganisationConfigRepository organisationConfigRepository;

    @Autowired
    public OrganisationConfigService(OrganisationConfigRepository organisationConfigRepository) {

        this.organisationConfigRepository = organisationConfigRepository;
    }

    public OrganisationConfig saveOrganisationConfig(OrganisationConfigRequest request, Organisation organisation) {
        OrganisationConfig organisationConfig = organisationConfigRepository.findByOrganisationId(organisation.getId());
        if (organisationConfig == null) {
            organisationConfig = new OrganisationConfig();
        }
        organisationConfig.setOrganisationId(organisation.getId());
        organisationConfig.setUuid(request.getUuid() == null ? UUID.randomUUID().toString() : request.getUuid());
        organisationConfig.setSettings(request.getSettings());
        organisationConfig.setWorklistUpdationRule(request.getWorklistUpdationRule());
        organisationConfigRepository.save(organisationConfig);
        return organisationConfig;
    }
}
