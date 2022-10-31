package org.avni.server.service;

import org.avni.server.dao.GenderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class GenderService implements NonScopeAwareService {

    private final GenderRepository genderRepository;

    @Autowired
    public GenderService(GenderRepository genderRepository) {
        this.genderRepository = genderRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return genderRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
