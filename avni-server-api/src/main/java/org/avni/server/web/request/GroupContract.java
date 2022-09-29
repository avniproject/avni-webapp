package org.avni.server.web.request;

import org.avni.server.domain.Group;

public class GroupContract extends CHSRequest {

    private String name;
    private boolean hasAllPrivileges;

    public static GroupContract fromEntity(Group group) {
        GroupContract groupContract = new GroupContract();
        groupContract.setName(group.getName());
        groupContract.setHasAllPrivileges(group.isHasAllPrivileges());
        groupContract.setUuid(group.getUuid());
        return groupContract;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isHasAllPrivileges() {
        return hasAllPrivileges;
    }

    public void setHasAllPrivileges(boolean hasAllPrivileges) {
        this.hasAllPrivileges = hasAllPrivileges;
    }
}
