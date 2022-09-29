package org.avni.server.service;

import org.avni.server.dao.DashboardSectionRepository;
import org.joda.time.DateTime;
import org.springframework.stereotype.Service;

@Service
public class DashboardSectionService implements NonScopeAwareService {

    private final DashboardSectionRepository dashboardSectionRepository;

    public DashboardSectionService(DashboardSectionRepository dashboardSectionRepository) {
        this.dashboardSectionRepository = dashboardSectionRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return dashboardSectionRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
