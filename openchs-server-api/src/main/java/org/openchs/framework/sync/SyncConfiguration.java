package org.openchs.framework.sync;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.handler.MappedInterceptor;

import java.util.Arrays;
import java.util.List;

@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SyncConfiguration extends WebMvcConfigurerAdapter {
    private final TransactionalResourceInterceptor transactionalResourceInterceptor;

    public static final List<String> RESOURCES = Arrays.asList("addressLevel",
            "locations",
            "locationMapping",
            "catchment",
            "checklist",
            "txNewChecklistEntity",
            "checklistItem",
            "txNewChecklistItemEntity",
            "concept",
            "conceptAnswer",
            "encounter",
            "encounterType",
            "form",
            "formElement",
            "formElementGroup",
            "formMapping",
            "gender",
            "individual",
            "individualRelation",
            "individualRelationGenderMapping",
            "individualRelationshipType",
            "individualRelationship",
            "operationalEncounterType",
            "operationalProgram",
            "program",
            "programConfig",
            "programEncounter",
            "programEnrolment",
            "programOutcome",
            "ruleDependency",
            "checklistDetail",
            "checklistItemDetail",
            "rule",
            "video",
            "userInfo");

    private final String[] paths;

    @Autowired
    public SyncConfiguration(TransactionalResourceInterceptor transactionalResourceInterceptor) {
        this.transactionalResourceInterceptor = transactionalResourceInterceptor;
        paths = RESOURCES.stream().map(path-> "/" + path + "/**").toArray(String[]::new);
    }

    @Bean("mappedTransactionalResourceInterceptor")
    public MappedInterceptor mappedTransactionalResourceInterceptor() {
        return new MappedInterceptor(paths, transactionalResourceInterceptor);
    }
}
