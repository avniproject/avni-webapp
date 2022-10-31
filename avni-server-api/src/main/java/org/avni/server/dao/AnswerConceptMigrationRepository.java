package org.avni.server.dao;

import org.avni.server.domain.AnswerConceptMigration;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@PreAuthorize("hasAnyAuthority('user')")
public interface AnswerConceptMigrationRepository extends ReferenceDataRepository<AnswerConceptMigration> {

    default AnswerConceptMigration findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in AnswerConceptMigration");
    }

    default AnswerConceptMigration findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in AnswerConceptMigration");
    }
}
