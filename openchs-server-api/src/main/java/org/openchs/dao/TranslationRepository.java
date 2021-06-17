package org.openchs.dao;

import org.openchs.domain.Locale;
import org.openchs.domain.Translation;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "translation", path = "translation")
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface TranslationRepository extends ReferenceDataRepository<Translation>, FindByLastModifiedDateTime<Translation> {

    Translation findByLanguage(Locale language);

    Translation findByOrganisationIdAndLanguage(Long organisationId,Locale language);

    default Translation findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in Location. Field 'title' not unique.");
    }

    default Translation findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in Location. Field 'title' not unique.");
    }
}
