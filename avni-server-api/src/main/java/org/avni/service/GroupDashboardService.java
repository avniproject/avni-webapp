package org.avni.service;

import org.avni.dao.DashboardRepository;
import org.avni.dao.GroupDashboardRepository;
import org.avni.dao.GroupRepository;
import org.avni.domain.GroupDashboard;
import org.avni.web.request.GroupDashboardContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class GroupDashboardService {
    private final GroupDashboardRepository groupDashboardRepository;
    private final DashboardRepository dashboardRepository;
    private final GroupRepository groupRepository;

    @Autowired
    public GroupDashboardService(GroupDashboardRepository groupDashboardRepository, DashboardRepository dashboardRepository, GroupRepository groupRepository) {
        this.groupDashboardRepository = groupDashboardRepository;
        this.dashboardRepository = dashboardRepository;
        this.groupRepository = groupRepository;
    }

    public GroupDashboard save(GroupDashboardContract contract) {
        GroupDashboard groupDashboard = groupDashboardRepository.findByUuid(contract.getUuid());
        if (groupDashboard == null) {
            groupDashboard = new GroupDashboard();
        }
        contract.setUuid(UUID.randomUUID().toString());
        groupDashboard.setUuid(contract.getUuid());
        return buildAndSave(contract, groupDashboard);
    }

    private GroupDashboard buildAndSave(GroupDashboardContract contract, GroupDashboard groupDashboard) {
        groupDashboard.setDashboard(dashboardRepository.findOne(contract.getDashboardId()));
        groupDashboard.setGroup(groupRepository.findOne(contract.getGroupId()));
        groupDashboard.setPrimaryDashboard(contract.isPrimaryDashboard());
        groupDashboard = groupDashboardRepository.save(groupDashboard);
        if (contract.isPrimaryDashboard()) {
            List<GroupDashboard> nonPrimaryDashboards = groupDashboardRepository.findByGroup_IdAndIdNotAndIsVoidedFalse(contract.getGroupId(), groupDashboard.getId());
            for (GroupDashboard nonPrimaryDashboard : nonPrimaryDashboards) {
                nonPrimaryDashboard.setPrimaryDashboard(false);
            }
            groupDashboardRepository.saveAll(nonPrimaryDashboards);
        }
        return groupDashboard;
    }

    public GroupDashboard edit(GroupDashboardContract updates, Long id) {
        return buildAndSave(updates, groupDashboardRepository.findOne(id));
    }

    public void delete(GroupDashboard groupDashboard) {
        groupDashboard.setVoided(true);
        groupDashboardRepository.save(groupDashboard);
    }
}
