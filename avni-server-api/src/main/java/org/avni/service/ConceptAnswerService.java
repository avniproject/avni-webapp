package org.avni.service;

import org.joda.time.DateTime;
import org.avni.dao.ConceptAnswerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ConceptAnswerService implements NonScopeAwareService {

    private final ConceptAnswerRepository conceptAnswerRepository;

    @Autowired
    public ConceptAnswerService(ConceptAnswerRepository conceptAnswerRepository) {
        this.conceptAnswerRepository = conceptAnswerRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return conceptAnswerRepository.existsByAuditLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
