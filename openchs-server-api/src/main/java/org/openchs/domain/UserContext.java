package org.openchs.domain;

import java.util.Collection;
import java.util.HashSet;

public class UserContext {
    public static final String USER = "user";
    public static final String ORGANISATION_ADMIN = "organisation_admin";
    public static final String ADMIN = "admin";

    private Collection<String> roles = new HashSet<>();
    private Organisation organisation;
    private User user;
    private String username;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public String getOrganisationName() {
        return organisation == null ? null : organisation.getName();
    }
}