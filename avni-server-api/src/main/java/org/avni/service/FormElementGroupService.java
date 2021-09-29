package org.avni.service;

import org.joda.time.DateTime;
import org.avni.dao.application.FormElementGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FormElementGroupService implements NonScopeAwareService {

    private final FormElementGroupRepository formElementGroupRepository;

    @Autowired
    public FormElementGroupService(FormElementGroupRepository formElementGroupRepository) {
        this.formElementGroupRepository = formElementGroupRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return formElementGroupRepository.existsByAuditLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}

