package org.avni.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.domain.OperatingIndividualScope;
import org.avni.domain.JsonObject;
import org.avni.domain.User;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserContract extends ReferenceDataContract {
    private String username;
    private long catchmentId;
    private String phoneNumber;
    private String email;
    private boolean orgAdmin = false;
    private boolean admin = false;
    private String operatingIndividualScope = OperatingIndividualScope.None.toString();
    private JsonObject settings;
    private Long organisationId;
    private List<Long> accountIds;
    private boolean disabledInCognito;
    private String[] roles;
    private String password;
    private JsonObject syncSettings;
    private Set<Long> directAssignmentIds = new HashSet<>();

    public static UserContract fromEntity(User user) {
        UserContract userContract = new UserContract();
        userContract.setId(user.getId());
        userContract.setName(user.getName());
        userContract.setUsername(user.getUsername());
        userContract.setEmail(user.getEmail());
        userContract.setPhoneNumber(user.getPhoneNumber());
        userContract.setOrganisationId(user.getOrganisationId());
        userContract.setDisabledInCognito(user.isDisabledInCognito());
        userContract.setOrgAdmin(user.isOrgAdmin());
        userContract.setRoles(user.getRoles());
        return userContract;
    }

    public String[] getRoles() {
        return roles;
    }

    public void setRoles(String[] roles) {
        this.roles = roles;
    }

    public boolean isDisabledInCognito() {
        return disabledInCognito;
    }

    public void setDisabledInCognito(boolean disabledInCognito) {
        this.disabledInCognito = disabledInCognito;
    }

    public Long getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(Long organisationId) {
        this.organisationId = organisationId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public long getCatchmentId() {
        return catchmentId;
    }

    public void setCatchmentId(long catchmentId) {
        this.catchmentId = catchmentId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isOrgAdmin() {
        return orgAdmin;
    }

    public void setOrgAdmin(boolean orgAdmin) {
        this.orgAdmin = orgAdmin;
    }

    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }

    public String getOperatingIndividualScope() {
        return operatingIndividualScope;
    }

    public void setOperatingIndividualScope(String operatingIndividualScope) {
        this.operatingIndividualScope = operatingIndividualScope;
    }

    public JsonObject getSettings() {
        return settings;
    }

    public void setSettings(JsonObject settings) {
        this.settings = settings;
    }

    public List<Long> getAccountIds() {
        return accountIds == null ? new ArrayList<>() : accountIds;
    }

    public void setAccountIds(List<Long> accountIds) {
        this.accountIds = accountIds;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public JsonObject getSyncSettings() {
        return syncSettings;
    }

    public void setSyncSettings(JsonObject syncSettings) {
        this.syncSettings = syncSettings;
    }

    public Set<Long> getDirectAssignmentIds() {
        return directAssignmentIds;
    }

    public void setDirectAssignmentIds(Set<Long> directAssignmentIds) {
        this.directAssignmentIds = directAssignmentIds;
    }
}
