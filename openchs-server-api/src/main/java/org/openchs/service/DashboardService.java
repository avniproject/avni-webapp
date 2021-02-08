package org.openchs.service;

import org.openchs.dao.CardRepository;
import org.openchs.dao.DashboardCardMappingRepository;
import org.openchs.dao.DashboardRepository;
import org.openchs.domain.CHSBaseEntity;
import org.openchs.domain.Dashboard;
import org.openchs.domain.DashboardCardMapping;
import org.openchs.util.BadRequestError;
import org.openchs.web.request.CardContract;
import org.openchs.web.request.DashboardCardMappingContract;
import org.openchs.web.request.DashboardContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;
    private final CardRepository cardRepository;
    private final DashboardCardMappingRepository dashboardCardMappingRepository;

    @Autowired
    public DashboardService(DashboardRepository dashboardRepository,
                            CardRepository cardRepository,
                            DashboardCardMappingRepository dashboardCardMappingRepository) {
        this.dashboardRepository = dashboardRepository;
        this.cardRepository = cardRepository;
        this.dashboardCardMappingRepository = dashboardCardMappingRepository;
    }

    public Dashboard saveDashboard(DashboardContract dashboardContract) {
        assertNoExistingDashboardWithName(dashboardContract.getName());
        Dashboard dashboard = new Dashboard();
        dashboard.assignUUID();
        return buildDashboard(dashboardContract, dashboard);
    }

    public void uploadDashboard(DashboardContract dashboardContract) {
        Dashboard dashboard = dashboardRepository.findByUuid(dashboardContract.getUuid());
        if (dashboard == null) {
            dashboard = new Dashboard();
            dashboard.setUuid(dashboardContract.getUuid());
        }
        dashboard.setName(dashboardContract.getName());
        dashboard.setDescription(dashboardContract.getDescription());
        dashboard.setVoided(dashboardContract.isVoided());
        dashboardRepository.save(dashboard);
    }

    public void uploadDashboardCardMapping(DashboardCardMappingContract dashboardCardMappingContract) {
        DashboardCardMapping dashboardCardMapping = dashboardCardMappingRepository.findByUuid(dashboardCardMappingContract.getUuid());
        if (dashboardCardMapping == null) {
            dashboardCardMapping = new DashboardCardMapping();
            dashboardCardMapping.setUuid(dashboardCardMappingContract.getUuid());
        }
        dashboardCardMapping.setDashboard(dashboardRepository.findByUuid(dashboardCardMappingContract.getDashboardUUID()));
        dashboardCardMapping.setCard(cardRepository.findByUuid(dashboardCardMappingContract.getReportCardUUID()));
        dashboardCardMapping.setDisplayOrder(dashboardCardMappingContract.getDisplayOrder());
        dashboardCardMappingRepository.save(dashboardCardMapping);
    }

    public List<DashboardCardMappingContract> getAllDashboardCardMappings() {
        List<DashboardCardMapping> dashboardCardMappings = dashboardCardMappingRepository.findAll();
        return dashboardCardMappings.stream().map(DashboardCardMappingContract::fromEntity).collect(Collectors.toList());
    }

    public Dashboard editDashboard(DashboardContract newDashboard, Long dashboardId) {
        Dashboard existingDashboard = dashboardRepository.findOne(dashboardId);
        assertNewNameIsUnique(newDashboard.getName(), existingDashboard.getName());
        return buildDashboard(newDashboard, existingDashboard);
    }

    public void deleteDashboard(Dashboard dashboard) {
        dashboard.setVoided(true);
        dashboardRepository.save(dashboard);
    }

    public List<DashboardContract> getAll() {
        List<Dashboard> dashboards = dashboardRepository.findAll();
        return dashboards.stream().map(DashboardContract::fromEntity).collect(Collectors.toList());
    }

    private Dashboard buildDashboard(DashboardContract dashboardContract, Dashboard dashboard) {
        dashboard.setName(dashboardContract.getName());
        dashboard.setDescription(dashboardContract.getDescription());
        dashboard.setVoided(dashboardContract.isVoided());
        Dashboard savedDashboard = dashboardRepository.save(dashboard);
        setDashboardCardMappings(dashboardContract, dashboard);
        return savedDashboard;
    }

    private void setDashboardCardMappings(DashboardContract dashboardContract, Dashboard dashboard) {
        Set<DashboardCardMapping> updatedMappings = new HashSet<>();
        List<CardContract> cardContracts = dashboardContract.getCards();
        for (CardContract cardContract : cardContracts) {
            DashboardCardMapping dashboardCardMapping = dashboardCardMappingRepository.findByCardIdAndDashboardAndIsVoidedFalse(cardContract.getId(), dashboard);
            if (dashboardCardMapping == null) {
                dashboardCardMapping = new DashboardCardMapping();
                dashboardCardMapping.assignUUID();
                dashboardCardMapping.setDashboard(dashboard);
                dashboardCardMapping.setCard(cardRepository.findOne(cardContract.getId()));
            }
            dashboardCardMapping.setDisplayOrder(cardContract.getDisplayOrder());
            updatedMappings.add(dashboardCardMapping);
        }
        Set<DashboardCardMapping> savedMappings = dashboard.getDashboardCardMappings();
        voidOldMappings(updatedMappings, savedMappings);
        dashboard.setDashboardCardMappings(updatedMappings);
        dashboardCardMappingRepository.saveAll(updatedMappings);
    }

    private void voidOldMappings(Set<DashboardCardMapping> newMappings, Set<DashboardCardMapping> savedMappings) {
        Set<Long> updatedMappingIds = newMappings.stream()
                .filter(m -> m.getId() != null)
                .map(CHSBaseEntity::getId)
                .collect(Collectors.toSet());
        for (DashboardCardMapping savedMapping : savedMappings) {
            if (!updatedMappingIds.contains(savedMapping.getId())) {
                DashboardCardMapping dashboardCardMapping = dashboardCardMappingRepository.findOne(savedMapping.getId());
                dashboardCardMapping.setVoided(true);
            }
        }
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
