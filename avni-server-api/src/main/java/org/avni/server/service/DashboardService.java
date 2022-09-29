package org.avni.server.service;

import org.avni.server.dao.CardRepository;
import org.avni.server.dao.DashboardRepository;
import org.avni.server.dao.DashboardSectionCardMappingRepository;
import org.avni.server.dao.DashboardSectionRepository;
import org.avni.server.domain.CHSBaseEntity;
import org.avni.server.domain.Dashboard;
import org.avni.server.domain.DashboardSection;
import org.avni.server.domain.DashboardSectionCardMapping;
import org.avni.server.util.BadRequestError;
import org.avni.server.web.request.CardContract;
import org.avni.server.web.request.DashboardContract;
import org.avni.server.web.request.DashboardSectionCardMappingContract;
import org.avni.server.web.request.DashboardSectionContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DashboardService implements NonScopeAwareService {

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
        Dashboard savedDashboard = dashboardRepository.save(dashboard);;
        uploadDashboardSections(dashboardContract, savedDashboard);
    }

    private void uploadDashboardSections(DashboardContract dashboardContract, Dashboard dashboard) {
        for (DashboardSectionContract sectionContract : dashboardContract.getSections()) {
            DashboardSection section = dashboardSectionRepository.findByUuid(sectionContract.getUuid());
            if (section == null) {
                section = new DashboardSection();
                section.setUuid(sectionContract.getUuid());
            }
            section.setDashboard(dashboard);
            section.setName(sectionContract.getName());
            section.setDescription(sectionContract.getDescription());
            section.setViewType(DashboardSection.ViewType.valueOf(sectionContract.getViewType()));
            section.setDisplayOrder(sectionContract.getDisplayOrder());
            section.setVoided(sectionContract.isVoided());
            DashboardSection savedSection = dashboardSectionRepository.save(section);

            for (DashboardSectionCardMappingContract cardMappingContract : sectionContract.getDashboardSectionCardMappings()) {
                DashboardSectionCardMapping mapping = dashboardSectionCardMappingRepository.findByUuid(cardMappingContract.getUuid());
                if (mapping == null) {
                    mapping = new DashboardSectionCardMapping();
                    mapping.setUuid(cardMappingContract.getUuid());
                }
                mapping.setDashboardSection(savedSection);
                mapping.setCard(cardRepository.findByUuid(cardMappingContract.getReportCardUUID()));
                mapping.setDisplayOrder(cardMappingContract.getDisplayOrder());
                mapping.setVoided(cardMappingContract.isVoided());
                dashboardSectionCardMappingRepository.save(mapping);
            }
        }
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
        dashboardRepository.save(dashboard);
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
            section = dashboardSectionRepository.save(section);

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

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return dashboardRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
