package org.openchs.domain;

import java.util.Collection;
import java.util.HashSet;

public class UserContext {
    private String userName;
    public static final String USER = "user";
    public static final String ORGANISATION_ADMIN = "organisation_admin";
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
        return addRole(USER);
    }

    public UserContext addOrganisationAdminRole() {
        return addRole(ORGANISATION_ADMIN);
    }

    public UserContext addAdminRole() {
        return addRole(ADMIN);
    }

    public UserContext addRole(String role) {
        this.roles.add(role);
        return this;
    }

    public Organisation getOrganisation() {
        return organisation;
    }

    public void setOrganisation(Organisation organisation) {
        this.organisation = organisation;
    }
}