package org.openchs.reporting;

import org.openchs.application.FormElement;
import org.openchs.application.FormElementGroup;
import org.openchs.application.FormMapping;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.domain.ConceptDataType;

import java.util.ArrayList;
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
            withClauses.add(conceptMapTemplate.replace("${mapNumber}", formElementGroup.getId().toString()).replace("${conceptUuids}", Stream.of(conceptUuids).collect(Collectors.joining("','", "'", "'"))));
        });
        return withClauses.isEmpty()? " ": Stream.of(withClauses.toArray(new String[formElementGroups.size()])).collect(Collectors.joining(",", "with ", ""));
    }

    static String generateJoins(FormMapping formMapping) {
        Set<FormElementGroup> formElementGroups = formMapping.getForm().getFormElementGroups();
        String[] joins = formElementGroups.stream().map(formElementGroup -> String.format("cross join concepts_%d", formElementGroup.getId())).toArray(String[]::new);
        return Stream.of(joins).collect(Collectors.joining("\n", "", "\n"));
    }
}
