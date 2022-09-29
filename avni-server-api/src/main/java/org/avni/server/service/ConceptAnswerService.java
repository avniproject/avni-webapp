package org.avni.server.service;

import org.avni.server.dao.ConceptAnswerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class ConceptAnswerService implements NonScopeAwareService {

    private final ConceptAnswerRepository conceptAnswerRepository;

    @Autowired
    public ConceptAnswerService(ConceptAnswerRepository conceptAnswerRepository) {
        this.conceptAnswerRepository = conceptAnswerRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return conceptAnswerRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
