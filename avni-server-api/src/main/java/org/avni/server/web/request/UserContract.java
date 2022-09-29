package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.domain.OperatingIndividualScope;
import org.avni.server.domain.JsonObject;
import org.avni.server.domain.User;
import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserContract extends ReferenceDataContract {
    private String username;
    private Long catchmentId;
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
    private String createdBy;
    private String lastModifiedBy;
    private DateTime lastModifiedDateTime;
    private DateTime createdDateTime;

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
        userContract.setCatchmentId(user.getCatchmentId().orElse(null));
        userContract.setSettings(user.getSettings());
        userContract.setCreatedBy(user.getCreatedByUserName());
        userContract.setCreatedDateTime(user.getCreatedDateTime());
        userContract.setLastModifiedBy(user.getLastModifiedByUserName());
        userContract.setLastModifiedDateTime(user.getLastModifiedDateTime());
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

    public Long getCatchmentId() {
        return catchmentId;
    }

    public void setCatchmentId(Long catchmentId) {
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

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public DateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public void setLastModifiedDateTime(DateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime;
    }

    public DateTime getCreatedDateTime() {
        return createdDateTime;
    }

    public void setCreatedDateTime(DateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }
}
