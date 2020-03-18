package org.openchs.web.request;

import org.openchs.domain.UserGroup;

public class UserGroupContract {

    private String userName;
    private String name;
    private String groupName;
    private String email;
    private Long userId;
    private String phoneNumber;

    public static UserGroupContract fromEntity(UserGroup userGroup) {
        UserGroupContract userGroupContract = new UserGroupContract();
        userGroupContract.setGroupName(userGroup.getGroupName());
        userGroupContract.setUserName(userGroup.getUser().getUsername());
        userGroupContract.setEmail(userGroup.getUser().getEmail());
        userGroupContract.setUserId(userGroup.getUser().getId());
        userGroupContract.setPhoneNumber(userGroup.getUser().getPhoneNumber());
        userGroupContract.setName(userGroup.getUser().getName());
        return userGroupContract;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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