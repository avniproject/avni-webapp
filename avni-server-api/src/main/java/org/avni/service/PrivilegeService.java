package org.avni.service;

import org.joda.time.DateTime;
import org.avni.dao.PrivilegeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PrivilegeService implements NonScopeAwareService {

    private final PrivilegeRepository privilegeRepository;

    @Autowired
    public PrivilegeService(PrivilegeRepository privilegeRepository) {
        this.privilegeRepository = privilegeRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return privilegeRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
