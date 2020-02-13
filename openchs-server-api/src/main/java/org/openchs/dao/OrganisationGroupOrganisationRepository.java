package org.openchs.dao;

import org.openchs.domain.OrganisationGroupOrganisation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "organisationGroupOrganisation", path = "organisationGroupOrganisation")
public interface OrganisationGroupOrganisationRepository extends CrudRepository<OrganisationGroupOrganisation, Long> {
}
