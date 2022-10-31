package org.avni.server.service;

import org.avni.server.dao.ProgramOrganisationConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class ProgramConfigService implements NonScopeAwareService {

    private final ProgramOrganisationConfigRepository programOrganisationConfigRepository;

    @Autowired
    public ProgramConfigService(ProgramOrganisationConfigRepository programOrganisationConfigRepository) {
        this.programOrganisationConfigRepository = programOrganisationConfigRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return programOrganisationConfigRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
