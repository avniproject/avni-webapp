package org.avni.server.web.request;

import org.avni.server.domain.UserGroup;

public class UserGroupContract {

    private long id;
    private String userName;
    private String name;
    private String groupName;
    private String email;
    private Long userId;
    private Long groupId;
    private String phoneNumber;
    private String uuid;

    public static UserGroupContract fromEntity(UserGroup userGroup) {
        UserGroupContract userGroupContract = new UserGroupContract();
        userGroupContract.setId(userGroup.getId());
        userGroupContract.setUuid(userGroup.getUuid());
        userGroupContract.setGroupName(userGroup.getGroupName());
        userGroupContract.setGroupId(userGroup.getGroupId());
        userGroupContract.setUserName(userGroup.getUser().getUsername());
        userGroupContract.setEmail(userGroup.getUser().getEmail());
        userGroupContract.setUserId(userGroup.getUser().getId());
        userGroupContract.setPhoneNumber(userGroup.getUser().getPhoneNumber());
        userGroupContract.setName(userGroup.getUser().getName());
        return userGroupContract;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
