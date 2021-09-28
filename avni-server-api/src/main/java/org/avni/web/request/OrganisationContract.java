package org.avni.web.request;

import org.avni.domain.Organisation;

public class OrganisationContract extends CHSRequest {
    private Long parentOrganisationId;
    private String name;
    private String dbUser;
    private String schemaName;
    private String mediaDirectory;
    private String usernameSuffix;
    private Long accountId;

    public static OrganisationContract fromEntity(Organisation organisation) {
        OrganisationContract organisationContract = new OrganisationContract();
        organisationContract.setId(organisation.getId());
        organisationContract.setUuid(organisation.getUuid());
        organisationContract.setParentOrganisationId(organisation.getParentOrganisationId());
        organisationContract.setName(organisation.getName());
        organisationContract.setDbUser(organisation.getDbUser());
        organisationContract.setSchemaName(organisation.getSchemaName());
        organisationContract.setMediaDirectory(organisation.getMediaDirectory());
        organisationContract.setUsernameSuffix(organisation.getUsernameSuffix());
        organisationContract.setAccountId(organisation.getAccount() == null ? null : organisation.getAccount().getId());
        return organisationContract;
    }

    public Long getParentOrganisationId() {
        return parentOrganisationId;
    }

    public void setParentOrganisationId(Long parentOrganisationId) {
        this.parentOrganisationId = parentOrganisationId;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getUsernameSuffix() {
        return usernameSuffix;
    }

    public void setUsernameSuffix(String usernameSuffix) {
        this.usernameSuffix = usernameSuffix;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDbUser() {
        return dbUser;
    }

    public void setDbUser(String dbUser) {
        this.dbUser = dbUser;
    }

    public String getMediaDirectory() {
        return mediaDirectory;
    }

    public void setMediaDirectory(String mediaDirectory) {
        this.mediaDirectory = mediaDirectory;
    }

    public String getSchemaName() {
        return schemaName;
    }

    public void setSchemaName(String schemaName) {
        this.schemaName = schemaName;
    }
}
