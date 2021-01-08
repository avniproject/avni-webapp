package org.openchs.service;

import org.openchs.dao.CardRepository;
import org.openchs.dao.DashboardRepository;
import org.openchs.domain.Dashboard;
import org.openchs.domain.DashboardCardMapping;
import org.openchs.util.BadRequestError;
import org.openchs.web.request.CardContract;
import org.openchs.web.request.DashboardContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;
    private final CardRepository cardRepository;

    @Autowired
    public DashboardService(DashboardRepository dashboardRepository,
                            CardRepository cardRepository) {
        this.dashboardRepository = dashboardRepository;
        this.cardRepository = cardRepository;
    }

    public Dashboard saveDashboard(DashboardContract dashboardContract) {
        assertNoExistingDashboardWithName(dashboardContract.getName());
        Dashboard dashboard = new Dashboard();
        dashboard.assignUUID();
        buildDashboard(dashboardContract, dashboard);
        dashboardRepository.save(dashboard);
        return dashboard;
    }

    public Dashboard editDashboard(DashboardContract newDashboard, Long dashboardId) {
        Dashboard existingDashboard = dashboardRepository.findOne(dashboardId);
        assertNewNameIsUnique(newDashboard.getName(), existingDashboard.getName());
        buildDashboard(newDashboard, existingDashboard);
        dashboardRepository.save(existingDashboard);
        return existingDashboard;
    }

    public void deleteDashboard(Dashboard dashboard) {
        dashboard.setVoided(true);
        dashboardRepository.save(dashboard);
    }

    private void buildDashboard(DashboardContract dashboardContract, Dashboard dashboard) {
        dashboard.setName(dashboardContract.getName());
        dashboard.setDescription(dashboardContract.getDescription());
        dashboard.setVoided(dashboardContract.isVoided());
        setDashboardCardMappings(dashboardContract, dashboard);
    }

    private void setDashboardCardMappings(DashboardContract dashboardContract, Dashboard dashboard) {
        Set<DashboardCardMapping> updatedMappings = new HashSet<>();
        List<CardContract> cardContracts = dashboardContract.getCards();
        for (CardContract cardContract : cardContracts) {
            DashboardCardMapping dashboardCardMapping = new DashboardCardMapping();
            dashboardCardMapping.assignUUID();
            dashboardCardMapping.setDashboard(dashboard);
            dashboardCardMapping.setDisplayOrder(cardContract.getDisplayOrder());
            dashboardCardMapping.setCard(cardRepository.findOne(cardContract.getId()));
            updatedMappings.add(dashboardCardMapping);
        }
        dashboard.setDashboardCardMappings(updatedMappings);
    }

    private void assertNewNameIsUnique(String newName, String oldName) {
        if (!newName.equals(oldName)) {
            assertNoExistingDashboardWithName(newName);
        }
    }

    private void assertNoExistingDashboardWithName(String name) {
        Dashboard existingDashboard = dashboardRepository.findByName(name);
        if (existingDashboard != null) {
            throw new BadRequestError(String.format("Dashboard %s already exists", name));
        }
    }
}
