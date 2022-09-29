package org.avni.server.service;

import org.avni.server.dao.PrivilegeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

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
