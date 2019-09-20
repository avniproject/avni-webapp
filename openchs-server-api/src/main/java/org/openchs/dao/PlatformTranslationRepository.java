package org.openchs.dao;

import org.openchs.application.Platform;
import org.openchs.domain.Locale;
import org.openchs.domain.PlatformTranslation;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "platformTranslation", path = "platformTranslation")
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface PlatformTranslationRepository extends ReferenceDataRepository<PlatformTranslation>, FindByLastModifiedDateTime<PlatformTranslation> {

    default PlatformTranslation findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in Location. Field 'title' not unique.");
    }

    default PlatformTranslation findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in Location. Field 'title' not unique.");
    }

    PlatformTranslation findByPlatformAndLanguage(Platform platform, Locale language);
}
