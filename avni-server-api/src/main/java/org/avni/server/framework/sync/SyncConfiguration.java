package org.avni.server.framework.sync;

import org.avni.server.framework.hibernate.DummyInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.handler.MappedInterceptor;

import java.util.stream.Stream;

@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SyncConfiguration extends WebMvcConfigurerAdapter {
    private final TransactionalResourceInterceptor transactionalResourceInterceptor;
    private final MetadataResourceInterceptor metadataResourceInterceptor;
    private DummyInterceptor dummyInterceptor;

    private final String[] transactionalPathList = Stream.of(
            "checklist",
            "txNewChecklistEntity",
            "checklistItem",
            "txNewChecklistItemEntity",
            "encounter",
            "individual",
            "individualRelationship",
            "programEncounter",
            "programEnrolment",
            "videotelemetric",
            "identifierAssignmentPool",
            "api",
            "groupSubject",
            "entityApprovalStatus",
            "news",
            "comment",
            "commentThread",
            "resetSyncs"
    ).map(path-> "/" + path + "/**").toArray(String[]::new);

    private final String[] metadataPathList = Stream.of("addressLevel",
            "locations",
            "locationMapping",
            "catchment",
            "concept",
            "conceptAnswer",
            "encounterType",
            "form",
            "formElement",
            "formElementGroup",
            "formMapping",
            "gender",
            "individualRelation",
            "individualRelationGenderMapping",
            "individualRelationshipType",
            "operationalEncounterType",
            "operationalProgram",
            "program",
            "programConfig",
            "programOutcome",
            "ruleDependency",
            "checklistDetail",
            "checklistItemDetail",
            "rule",
            "video",
            "userInfo",
            "me",
            "subjectType",
            "operationalSubjectType",
            "identifierSource",
            "organisationConfig",
            "translation",
            "platformTranslation",
            "groups",
            "myGroups",
            "groupPrivilege",
            "privilege",
            "groupRole",
            "locationHierarchy",
            "card",
            "dashboard",
            "dashboardCardMapping",
            "groupDashboard",
            "standardReportCardType",
            "approvalStatus",
            "dashboardSectionCardMapping",
            "dashboardSection"
    ).map(path-> "/" + path + "/**").toArray(String[]::new);

    @Autowired
    public SyncConfiguration(TransactionalResourceInterceptor transactionalResourceInterceptor, MetadataResourceInterceptor metadataResourceInterceptor, DummyInterceptor dummyInterceptor) {
        this.transactionalResourceInterceptor = transactionalResourceInterceptor;
        this.metadataResourceInterceptor = metadataResourceInterceptor;
        this.dummyInterceptor = dummyInterceptor;
    }

    @Bean("mappedTransactionalResourceInterceptor")
    public MappedInterceptor mappedTransactionalResourceInterceptor() {
        return new MappedInterceptor(transactionalPathList, transactionalResourceInterceptor);
    }

    @Bean("mappedMetadataResourceInterceptor")
    public MappedInterceptor mappedMetadataResourceInterceptor() {
        return new MappedInterceptor(metadataPathList, metadataResourceInterceptor);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        super.addInterceptors(registry);
        registry.addInterceptor(dummyInterceptor);
    }
}
