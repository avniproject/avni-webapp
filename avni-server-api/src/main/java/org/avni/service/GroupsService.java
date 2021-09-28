package org.avni.service;

import org.avni.dao.GroupRepository;
import org.avni.domain.Group;
import org.avni.web.request.GroupContract;
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

    public Group saveGroup(GroupContract groupContract) {
        Group group = groupRepository.findByUuid(groupContract.getUuid());
        if (group == null) {
            group = new Group();
        }
        group.setUuid(groupContract.getUuid() == null ? UUID.randomUUID().toString() : groupContract.getUuid());
        group.setName(groupContract.getName());
        group.setHasAllPrivileges(groupContract.isHasAllPrivileges());
        return groupRepository.save(group);
    }
}
