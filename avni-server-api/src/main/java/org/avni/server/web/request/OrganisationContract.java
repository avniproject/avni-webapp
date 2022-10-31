package org.avni.server.web.request;

import org.avni.server.domain.Organisation;

public class OrganisationContract extends ETLContract {
    private Long parentOrganisationId;
    private String mediaDirectory;
    private String usernameSuffix;
    private Long accountId;

    public static OrganisationContract fromEntity(Organisation organisation) {
        OrganisationContract organisationContract = new OrganisationContract();
        organisationContract.setId(organisation.getId());
        organisationContract.setUuid(organisation.getUuid());
        organisationContract.setParentOrganisationId(organisation.getParentOrganisationId());
        organisationContract.setMediaDirectory(organisation.getMediaDirectory());
        organisationContract.setUsernameSuffix(organisation.getUsernameSuffix());
        organisationContract.setAccountId(organisation.getAccount() == null ? null : organisation.getAccount().getId());
        mapEntity(organisationContract, organisation);
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

    public String getMediaDirectory() {
        return mediaDirectory;
    }

    public void setMediaDirectory(String mediaDirectory) {
        this.mediaDirectory = mediaDirectory;
    }

}
