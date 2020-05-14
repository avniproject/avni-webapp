package org.openchs.service;

import org.openchs.dao.GroupRepository;
import org.openchs.domain.Group;
import org.openchs.web.request.GroupContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class GroupsService {

    private GroupRepository groupRepository;

    @Autowired
    public GroupsService(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    public Group saveGroup(GroupContract groupContract, Long organisationId) {
        Group group = groupRepository.findByUuid(groupContract.getUuid());
        if (group == null) {
            group = new Group();
        }
        group.setUuid(groupContract.getUuid() == null ? UUID.randomUUID().toString() : groupContract.getUuid());
        group.setName(groupContract.getName());
        group.setHasAllPrivileges(groupContract.isHasAllPrivileges());
        group.setOrganisationId(organisationId);
        return groupRepository.save(group);
    }
}
