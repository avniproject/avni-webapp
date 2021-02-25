package org.openchs.service;

import org.openchs.dao.CardRepository;
import org.openchs.dao.DashboardRepository;
import org.openchs.dao.DashboardSectionCardMappingRepository;
import org.openchs.dao.DashboardSectionRepository;
import org.openchs.domain.CHSBaseEntity;
import org.openchs.domain.Dashboard;
import org.openchs.domain.DashboardSectionCardMapping;
import org.openchs.domain.DashboardSection;
import org.openchs.util.BadRequestError;
import org.openchs.web.request.CardContract;
import org.openchs.web.request.DashboardSectionCardMappingContract;
import org.openchs.web.request.DashboardContract;
import org.openchs.web.request.DashboardSectionContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;
    private final CardRepository cardRepository;
    private final DashboardSectionRepository dashboardSectionRepository;
    private final DashboardSectionCardMappingRepository dashboardSectionCardMappingRepository;

    @Autowired
    public DashboardService(DashboardRepository dashboardRepository,
                            CardRepository cardRepository,
                            DashboardSectionRepository dashboardSectionRepository, DashboardSectionCardMappingRepository dashboardSectionCardMappingRepository) {
        this.dashboardRepository = dashboardRepository;
        this.cardRepository = cardRepository;
        this.dashboardSectionRepository = dashboardSectionRepository;
        this.dashboardSectionCardMappingRepository = dashboardSectionCardMappingRepository;
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

//    public void uploadDashboardCardMapping(DashboardSectionCardMappingContract dashboardCardMappingContract) {
//        DashboardCardMapping dashboardCardMapping = dashboardCardMappingRepository.findByUuid(dashboardCardMappingContract.getUuid());
//        if (dashboardCardMapping == null) {
//            dashboardCardMapping = new DashboardCardMapping();
//            dashboardCardMapping.setUuid(dashboardCardMappingContract.getUuid());
//        }
//        dashboardCardMapping.setDashboard(dashboardRepository.findByUuid(dashboardCardMappingContract.getDashboardUUID()));
//        dashboardCardMapping.setCard(cardRepository.findByUuid(dashboardCardMappingContract.getReportCardUUID()));
//        dashboardCardMapping.setDisplayOrder(dashboardCardMappingContract.getDisplayOrder());
//        dashboardCardMappingRepository.save(dashboardCardMapping);
//    }
//
//    public List<DashboardSectionCardMappingContract> getAllDashboardCardMappings() {
//        List<DashboardCardMapping> dashboardCardMappings = dashboardCardMappingRepository.findAll();
//        return dashboardCardMappings.stream().map(DashboardSectionCardMappingContract::fromEntity).collect(Collectors.toList());
//    }

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
        setDashboardSections(dashboardContract, dashboard);
        return dashboardRepository.save(dashboard);
    }

    private void setDashboardSections(DashboardContract dashboardContract, Dashboard dashboard) {
        Set<DashboardSection> dashboardSections = new HashSet<>();
        List<DashboardSectionContract> sectionContracts = dashboardContract.getSections();
        for (DashboardSectionContract sectionContract : sectionContracts) {
            Long sectionId = sectionContract.getId();
            DashboardSection section;
            if (sectionId != null) {
                section = dashboardSectionRepository.findOne(sectionContract.getId());
            } else {
                section = new DashboardSection();
                section.assignUUID();
            }
            section.setDashboard(dashboard);
            section.setName(sectionContract.getName());
            section.setDescription(sectionContract.getDescription());
            section.setViewType(DashboardSection.ViewType.valueOf(sectionContract.getViewType()));
            section.setDisplayOrder(sectionContract.getDisplayOrder());

            List<CardContract> cardContracts = sectionContract.getCards();
            Set<DashboardSectionCardMapping> updatedMappings = new HashSet<>();
            for (CardContract cardContract : cardContracts) {
                DashboardSectionCardMapping mapping = dashboardSectionCardMappingRepository.findByCardIdAndDashboardSectionAndIsVoidedFalse(cardContract.getId(), section);
                if (mapping == null) {
                    mapping = new DashboardSectionCardMapping();
                    mapping.assignUUID();
                    mapping.setDashboardSection(section);
                    mapping.setCard(cardRepository.findOne(cardContract.getId()));
                }
                mapping.setDisplayOrder(cardContract.getDisplayOrder());
                updatedMappings.add(mapping);
            }
            Set<DashboardSectionCardMapping> savedMappings = section.getDashboardSectionCardMappings();
            voidOldMappings(updatedMappings, savedMappings);
            section.setDashboardSectionCardMappings(updatedMappings);
            dashboardSectionCardMappingRepository.saveAll(updatedMappings);
            dashboardSections.add(section);
        }
        dashboard.setDashboardSections(dashboardSections);
    }

    private void voidOldMappings(Set<DashboardSectionCardMapping> newMappings, Set<DashboardSectionCardMapping> savedMappings) {
        Set<Long> updatedMappingIds = newMappings.stream()
                .map(CHSBaseEntity::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        for (DashboardSectionCardMapping savedMapping : savedMappings) {
            if (!updatedMappingIds.contains(savedMapping.getId())) {
                DashboardSectionCardMapping dashboardCardMapping = dashboardSectionCardMappingRepository.findOne(savedMapping.getId());
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
