package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.domain.JsonObject;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserBulkUploadContract extends ReferenceDataContract {
    private String organisationUUID;
    private Long organisationId;
    private String catchmentUUID;
    private long catchmentId;
    private boolean orgAdmin;
    private boolean admin;
    private String operatingIndividualScope;
    private JsonObject settings;
    private String phoneNumber;
    private String email;

    public String getOrganisationUUID() {
        return organisationUUID;
    }

    public void setOrganisationUUID(String organisationUUID) {
        this.organisationUUID = organisationUUID;
    }

    public String getCatchmentUUID() {
        return catchmentUUID;
    }

    public void setCatchmentUUID(String catchmentUUID) {
        this.catchmentUUID = catchmentUUID;
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

    public Long getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(Long organisationId) {
        this.organisationId = organisationId;
    }

    public long getCatchmentId() {
        return catchmentId;
    }

    public void setCatchmentId(long catchmentId) {
        this.catchmentId = catchmentId;
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
}
