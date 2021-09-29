package org.avni.service;

import org.joda.time.DateTime;
import org.avni.dao.ProgramOrganisationConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProgramConfigService implements NonScopeAwareService {

    private final ProgramOrganisationConfigRepository programOrganisationConfigRepository;

    @Autowired
    public ProgramConfigService(ProgramOrganisationConfigRepository programOrganisationConfigRepository) {
        this.programOrganisationConfigRepository = programOrganisationConfigRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return programOrganisationConfigRepository.existsByAuditLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
