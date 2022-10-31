package org.avni.server.framework.rest;

import org.avni.server.domain.*;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurerAdapter;

@Configuration
public class RepositoryConfig extends RepositoryRestConfigurerAdapter {
    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config) {
        config.exposeIdsFor(User.class);
        config.exposeIdsFor(Organisation.class);
        config.exposeIdsFor(Catchment.class);
        config.exposeIdsFor(AddressLevel.class);
        config.exposeIdsFor(AddressLevelType.class);
        config.exposeIdsFor(Concept.class);
        config.exposeIdsFor(Program.class);
        config.exposeIdsFor(SubjectType.class);
        config.exposeIdsFor(EncounterType.class);
        config.exposeIdsFor(OrganisationConfig.class);
        config.exposeIdsFor(IdentifierSource.class);
        config.exposeIdsFor(IdentifierUserAssignment.class);
        config.exposeIdsFor(Account.class);
        config.exposeIdsFor(OrganisationGroup.class);
        config.exposeIdsFor(Group.class);
        config.exposeIdsFor(Privilege.class);
        config.exposeIdsFor(GroupPrivilege.class);
        config.exposeIdsFor(UserGroup.class);
        config.exposeIdsFor(GroupRole.class);
        config.exposeIdsFor(Card.class);
        config.exposeIdsFor(Dashboard.class);
        config.exposeIdsFor(News.class);
        config.exposeIdsFor(Comment.class);
        config.exposeIdsFor(CommentThread.class);
        config.exposeIdsFor(RuleFailureTelemetry.class);
        config.exposeIdsFor(Individual.class);
    }
}
