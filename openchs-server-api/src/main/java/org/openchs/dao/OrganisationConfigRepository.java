package org.openchs.dao;

import org.openchs.domain.OrganisationConfig;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "organisationConfig", path = "organisationConfig")
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface OrganisationConfigRepository extends ReferenceDataRepository<OrganisationConfig>, FindByLastModifiedDateTime<OrganisationConfig> {
    default OrganisationConfig findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in Location. Field 'title' not unique.");
    }

    default OrganisationConfig findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in Location. Field 'title' not unique.");
    }
}
