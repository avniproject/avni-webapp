package org.openchs.dao;

import org.openchs.domain.Program;
import org.openchs.domain.ProgramRule;
import org.openchs.domain.Rule;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "programRule", path = "programRule")
public interface ProgramRuleRepository extends ImplReferenceDataRepository<ProgramRule> {
    List<ProgramRule> findByOrganisationId(Long id);
    List<ProgramRule> findByProgram(Program program);
    ProgramRule findByRule(Rule rule);
    ProgramRule findByRule_Uuid(String uuid);
    ProgramRule findByProgramAndRule(Program program, Rule rule);

    default ProgramRule findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in ProgramRule");
    }

    default ProgramRule findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in ProgramRule");
    }
}
