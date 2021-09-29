package org.avni.service;

import org.joda.time.DateTime;
import org.avni.dao.application.FormElementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FormElementService implements NonScopeAwareService {

    private final FormElementRepository formElementRepository;

    @Autowired
    public FormElementService(FormElementRepository formElementRepository) {
        this.formElementRepository = formElementRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return formElementRepository.existsByAuditLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}

