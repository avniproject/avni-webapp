package org.avni.server.web.request;

import org.avni.server.domain.OrganisationGroup;
import org.avni.server.domain.OrganisationGroupOrganisation;

import java.util.List;
import java.util.stream.Collectors;

public class OrganisationGroupContract extends ETLContract {
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
        ETLContract.mapEntity(organisationGroupContract, organisationGroup);
        return organisationGroupContract;
    }

    public List<Long> getOrganisationIds() {
        return organisationIds;
    }

    public void setOrganisationIds(List<Long> organisationIds) {
        this.organisationIds = organisationIds;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

}
