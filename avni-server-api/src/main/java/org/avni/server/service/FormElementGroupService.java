package org.avni.server.service;

import org.avni.server.dao.application.FormElementGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class FormElementGroupService implements NonScopeAwareService {

    private final FormElementGroupRepository formElementGroupRepository;

    @Autowired
    public FormElementGroupService(FormElementGroupRepository formElementGroupRepository) {
        this.formElementGroupRepository = formElementGroupRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return formElementGroupRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}

