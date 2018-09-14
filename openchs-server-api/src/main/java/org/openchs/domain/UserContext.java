package org.openchs.domain;

import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;

public class UserContext {
    private Collection<String> roles = new HashSet<>();
    private Organisation organisation;
    private User user;

    public User getUser() {
        return user;
    }

    public String getUserName() {
        User user = this.getUser();
        return user == null ? null : user.getName();
    }

    public void setUser(User user) {
        this.user = user;
        this.addRolesToContext();
    }

    private void addRolesToContext() {
        String[] roles = this.user.getRoles();
        Arrays.stream(roles).forEach(this::addRole);
    }

    public Collection<String> getRoles() {
        return roles;
    }

    public UserContext addUserRole() {
        return addRole(User.USER);
    }

    public UserContext addOrganisationAdminRole() {
        return addRole(User.ORGANISATION_ADMIN);
    }

    public UserContext addAdminRole() {
        return addRole(User.ADMIN);
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