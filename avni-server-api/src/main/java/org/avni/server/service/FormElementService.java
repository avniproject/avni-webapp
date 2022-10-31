package org.avni.server.service;

import org.avni.server.dao.application.FormElementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class FormElementService implements NonScopeAwareService {

    private final FormElementRepository formElementRepository;

    @Autowired
    public FormElementService(FormElementRepository formElementRepository) {
        this.formElementRepository = formElementRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return formElementRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}

