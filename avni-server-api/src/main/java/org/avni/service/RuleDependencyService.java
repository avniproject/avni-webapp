package org.avni.service;

import org.avni.dao.RuleDependencyRepository;
import org.avni.domain.CHSEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class RuleDependencyService implements NonScopeAwareService {

    private final RuleDependencyRepository ruleDependencyRepository;

    @Autowired
    public RuleDependencyService(RuleDependencyRepository ruleDependencyRepository) {
        this.ruleDependencyRepository = ruleDependencyRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return ruleDependencyRepository.existsByLastModifiedDateTimeGreaterThan(CHSEntity.toDate(lastModifiedDateTime));
    }
}
