package org.avni.server.dao;

import org.avni.server.domain.Msg91Config;
import org.springframework.stereotype.Repository;

@Repository
public interface Msg91ConfigRepository extends ReferenceDataRepository<Msg91Config> {

    default Msg91Config findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in Msg91Config");
    }

    default Msg91Config findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in Msg91Config");
    }

    Msg91Config findByOrganisationIdAndIsVoidedFalse(Long organisationId);

}
