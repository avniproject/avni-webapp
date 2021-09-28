package org.avni.web.request;

import org.avni.domain.OrganisationGroup;
import org.avni.domain.OrganisationGroupOrganisation;

import java.util.List;
import java.util.stream.Collectors;

public class OrganisationGroupContract {
    private Long id;
    private String name;
    private String dbUser;
    private Long accountId;
    private List<Long> organisationIds;

    public static OrganisationGroupContract fromEntity(OrganisationGroup organisationGroup) {
        OrganisationGroupContract organisationGroupContract = new OrganisationGroupContract();
        organisationGroupContract.setId(organisationGroup.getId());
        organisationGroupContract.setAccountId(organisationGroup.getAccount().getId());
        organisationGroupContract.setDbUser(organisationGroup.getDbUser());
        organisationGroupContract.setName(organisationGroup.getName());
        List<Long> orgIds = organisationGroup.getOrganisationGroupOrganisations().stream()
                .map(OrganisationGroupOrganisation::getOrganisationId).collect(Collectors.toList());
        organisationGroupContract.setOrganisationIds(orgIds);
        return organisationGroupContract;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Long> getOrganisationIds() {
        return organisationIds;
    }

    public void setOrganisationIds(List<Long> organisationIds) {
        this.organisationIds = organisationIds;
    }

    public String getDbUser() {
        return dbUser;
    }

    public void setDbUser(String dbUser) {
        this.dbUser = dbUser;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
