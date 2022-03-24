package org.avni.service;

import org.joda.time.DateTime;
import org.avni.dao.LocationMappingRepository;
import org.avni.dao.OperatingIndividualScopeAwareRepository;
import org.avni.domain.User;
import org.avni.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class LocationMappingService implements ScopeAwareService {

    private LocationMappingRepository locationMappingRepository;

    @Autowired
    public LocationMappingService(LocationMappingRepository locationMappingRepository) {
        this.locationMappingRepository = locationMappingRepository;
    }

    @Override
    public boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String typeUUID) {
        User user = UserContextHolder.getUserContext().getUser();
        return isChanged(user, lastModifiedDateTime, null, null);
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return locationMappingRepository;
    }

}
