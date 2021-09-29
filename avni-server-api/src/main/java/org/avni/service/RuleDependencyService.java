package org.avni.service;

import org.joda.time.DateTime;
import org.avni.dao.RuleDependencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RuleDependencyService implements NonScopeAwareService {

    private final RuleDependencyRepository ruleDependencyRepository;

    @Autowired
    public RuleDependencyService(RuleDependencyRepository ruleDependencyRepository) {
        this.ruleDependencyRepository = ruleDependencyRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return ruleDependencyRepository.existsByAuditLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
