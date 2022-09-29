package org.avni.server.service;

import org.avni.server.dao.ProgramOutcomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class ProgramOutcomeService implements NonScopeAwareService {

    private final ProgramOutcomeRepository programOutcomeRepository;

    @Autowired
    public ProgramOutcomeService(ProgramOutcomeRepository programOutcomeRepository) {
        this.programOutcomeRepository = programOutcomeRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return programOutcomeRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
