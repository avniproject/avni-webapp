package org.openchs.dao;

import org.openchs.domain.Translation;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "translation", path = "translation")
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface TranslationRepository extends ReferenceDataRepository<Translation>, FindByLastModifiedDateTime<Translation> {
    Translation findByOrganisationId(Long organisationId);

    default Translation findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in Location. Field 'title' not unique.");
    }

    default Translation findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in Location. Field 'title' not unique.");
    }
}
