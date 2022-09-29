package org.avni.server.domain;

import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;

public class UserContext {
    private Collection<String> roles = new HashSet<>();
    private Organisation organisation;
    private User user;
    private String organisationUUID;
    private String authToken;

    public String getOrganisationUUID() {
        return organisationUUID;
    }

    public void setOrganisationUUID(String organisationUUID) {
        this.organisationUUID = organisationUUID;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        this.addRolesToContext();
    }

    public String getUserName() {
        User user = this.getUser();
        return user == null ? null : user.getUsername();
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

    private Organisation nullSafeGetOrganisation() {
        return organisation == null ? new Organisation() : organisation;
    }

    public String getOrganisationName() {
        return nullSafeGetOrganisation().getName();
    }

    public Long getOrganisationId() {
        return nullSafeGetOrganisation().getId();
    }

    public String getMediaDirectory() {
        return nullSafeGetOrganisation().getMediaDirectory();
    }

    public String getAuthToken() {
        return authToken;
    }

    public void setAuthToken(String authToken) {
        this.authToken = authToken;
    }
}
