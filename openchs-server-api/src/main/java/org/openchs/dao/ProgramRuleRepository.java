package org.openchs.dao;

import org.openchs.domain.Program;
import org.openchs.domain.ProgramRule;
import org.openchs.domain.Rule;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "programRule", path = "programRule")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface ProgramRuleRepository extends PagingAndSortingRepository<ProgramRule, Long>, CHSRepository<ProgramRule> {
    List<ProgramRule> findByOrganisationId(Long id);
    List<ProgramRule> findByProgram(Program program);
    ProgramRule findByRule(Rule rule);
    ProgramRule findByRule_Uuid(String uuid);
    ProgramRule findByProgramAndRule(Program program, Rule rule);
}
