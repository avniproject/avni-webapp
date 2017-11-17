package org.openchs.domain;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;

public class UserContext {
    private String userName;
    public static final String USER = "user";
    public static final String USER_ADMIN = "user_admin";
    public static final String ADMIN = "admin";

    private Collection<String> roles = new HashSet<>();
    private Organisation organisation;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Collection<String> getRoles() {
        return roles;
    }

    public UserContext addUserRole() {
        this.roles.add(USER);
        return this;
    }

    public UserContext addUserAdminRole() {
        this.roles.add(USER_ADMIN);
        return this;
    }

    public UserContext addAdminRole() {
        this.roles.add(ADMIN);
        return this;
    }

    public Organisation getOrganisation() {
        return organisation;
    }

    public void setOrganisation(Organisation organisation) {
        this.organisation = organisation;
    }
}