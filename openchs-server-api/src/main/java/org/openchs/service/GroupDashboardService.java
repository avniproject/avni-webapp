package org.openchs.service;

import org.openchs.dao.DashboardRepository;
import org.openchs.dao.GroupDashboardRepository;
import org.openchs.dao.GroupRepository;
import org.openchs.domain.GroupDashboard;
import org.openchs.web.request.GroupDashboardContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        return buildAndSave(contract, groupDashboard);
    }

    private GroupDashboard buildAndSave(GroupDashboardContract contract, GroupDashboard groupDashboard) {
        groupDashboard.setUuid(contract.getUuid());
        groupDashboard.setDashboard(dashboardRepository.findOne(contract.getDashboardId()));
        groupDashboard.setGroup(groupRepository.findOne(contract.getGroupId()));
        groupDashboard.setPrimaryDashboard(contract.isPrimaryDashboard());
        return groupDashboardRepository.save(groupDashboard);
    }

    public GroupDashboard edit(GroupDashboardContract updates, Long id) {
        return buildAndSave(updates, groupDashboardRepository.findOne(id));
    }

    public void delete(GroupDashboard groupDashboard) {
        groupDashboard.setVoided(true);
        groupDashboardRepository.save(groupDashboard);
    }
}
