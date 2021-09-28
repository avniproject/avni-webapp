package org.avni.reporting;

import org.avni.application.FormElement;
import org.avni.application.FormElementGroup;
import org.avni.application.FormMapping;
import org.avni.dao.application.FormElementRepository;
import org.avni.domain.Concept;
import org.avni.domain.ConceptDataType;
import org.avni.domain.reporting.Names;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ConceptMapSQLGenerator {
    static String generateWithClauses(FormMapping formMapping, FormElementRepository formElementRepository, String conceptMapTemplate) {
        Set<FormElementGroup> formElementGroups = formMapping.getForm().getFormElementGroups();
        List<String> withClauses = new ArrayList<>();
        formElementGroups.forEach(formElementGroup -> {
            List<FormElement> formElements = formElementRepository.findAllByFormElementGroupIdAndConceptDataType(formElementGroup.getId(), ConceptDataType.Coded.name());
            String[] conceptUuids = formElements.stream().map(formElement -> formElement.getConcept().getUuid()).distinct().toArray(String[]::new);
            withClauses.add(fillConceptMapTemplate(conceptMapTemplate, String.format("concepts_%d", formElementGroup.getId()), conceptUuids));
        });
        withClauses.add(fillConceptMapTemplate(conceptMapTemplate, Names.DecisionConceptMapName, getDecisionConcepts(formMapping)));
        return withClauses.isEmpty()? " ": Stream.of(withClauses.toArray(new String[formElementGroups.size()])).collect(Collectors.joining(",", "with ", ""));
    }

    static String generateJoins(FormMapping formMapping) {
        Set<FormElementGroup> formElementGroups = formMapping.getForm().getFormElementGroups();
        String[] formConceptJoins = formElementGroups.stream().map(formElementGroup -> String.format("cross join concepts_%d", formElementGroup.getId())).toArray(String[]::new);
        String[] decisionConceptJoins = {String.format("cross join %s", Names.DecisionConceptMapName)};
        String[] joins = Stream.concat(Arrays.stream(formConceptJoins), Arrays.stream(decisionConceptJoins)).toArray(String[]::new);
        return Stream.of(joins).collect(Collectors.joining("\n", "", "\n"));
    }

    private static String[] getDecisionConcepts(FormMapping formMapping) {
        Set<Concept> decisionConcepts = formMapping.getForm().getDecisionConcepts();
        return decisionConcepts.stream().map(concept -> concept.getUuid()).distinct().toArray(String[]::new);
    }

    private static String fillConceptMapTemplate(String conceptMapTemplate, String mapName, String[] conceptUuids) {
        return conceptMapTemplate
                .replace("${mapName}", mapName)
                .replace("${conceptUuids}", Stream.of(conceptUuids).collect(Collectors.joining("','", "'", "'")));
    }
}
