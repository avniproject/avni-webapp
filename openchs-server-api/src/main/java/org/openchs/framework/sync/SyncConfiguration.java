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
import java.util.stream.Collectors;

@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SyncConfiguration extends WebMvcConfigurerAdapter {
    private final TransactionalResourceInterceptor transactionalResourceInterceptor;

    public static final List<String> RESOURCES = Arrays.asList("addressLevel",
            "catchment",
            "checklist",
            "checklistItem",
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
            "rule");

    private List<String> paths;

    @Autowired
    public SyncConfiguration(TransactionalResourceInterceptor transactionalResourceInterceptor) {
        this.transactionalResourceInterceptor = transactionalResourceInterceptor;
        paths = RESOURCES
                .stream().map((path) -> "/" + path + "/**").collect(Collectors.toList());
    }

    @Bean("mappedTransactionalResourceInterceptor")
    public MappedInterceptor mappedTransactionalResourceInterceptor() {
        return new MappedInterceptor(this.paths.toArray(new String[]{}), transactionalResourceInterceptor);
    }
}
