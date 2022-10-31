package org.avni.server.service;

import org.avni.server.domain.Organisation;
import org.avni.server.domain.Program;
import org.avni.server.domain.SubjectType;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class ViewNameGenerator {
    private static final int POSTGRES_MAX_VIEW_NAME_LENGTH = 63;
    private Organisation organisation;

    public ViewNameGenerator(Organisation organisation) {
        this.organisation = organisation;
    }

    private static final Map<String, List<Integer>> viewTypeTrimmingMap = new HashMap<String, List<Integer>>() {{
        put("Registration", Arrays.asList(0, 6));
        put("Encounter", Arrays.asList(0, 6, 20));
        put("ProgramEnrolment", Arrays.asList(0, 6, 20));
        put("ProgramEncounter", Arrays.asList(0, 6, 6, 20));
    }};

    private String buildProperViewName(List<String> entities) {
        List<String> list = entities.stream()
                .map(String::toLowerCase)
                .map(e -> e.replaceAll("[^a-z0-9_\\s]", "").replaceAll("\\s+", "_"))
                .collect(Collectors.toList());
        return String.join("_", list);
    }

    public String getGeneralEncounterViewName(SubjectType subjectType, String encounterType) {
        return getViewName(Arrays.asList(getViewNamePrefix(organisation), subjectType.getOperationalSubjectTypeName(), encounterType), "Encounter");
    }

    public String getGeneralEncounterCancelViewName(SubjectType subjectType, String encounterType) {
        return getViewName(Arrays.asList(getViewNamePrefix(organisation), subjectType.getOperationalSubjectTypeName(), getCancelName(encounterType)), "Encounter");
    }

    public String getProgramEncounterViewName(SubjectType subjectType, Program program, String encounterType) {
        return this.getViewName(Arrays.asList(getViewNamePrefix(organisation), subjectType.getOperationalSubjectTypeName(), program.getOperationalProgramName(), encounterType), "ProgramEncounter");
    }

    public String getProgramEncounterCancelViewName(SubjectType subjectType, Program program, String encounterType) {
        return this.getViewName(Arrays.asList(getViewNamePrefix(organisation), subjectType.getOperationalSubjectTypeName(), program.getOperationalProgramName(), getCancelName(encounterType)), "ProgramEncounter");
    }

    public String getSubjectRegistrationViewName(SubjectType subjectType) {
        return getViewName(Arrays.asList(getViewNamePrefix(organisation), subjectType.getOperationalSubjectTypeName()), "Registration");
    }

    public String getProgramEnrolmentViewName(SubjectType subjectType, String program) {
        return getViewName(Arrays.asList(getViewNamePrefix(organisation), subjectType.getOperationalSubjectTypeName(), program), "ProgramEnrolment");
    }

    public String getProgramEnrolmentExitViewName(SubjectType subjectType, String program) {
        return getViewName(Arrays.asList(getViewNamePrefix(organisation), subjectType.getOperationalSubjectTypeName(), getExitName(program)), "ProgramEnrolment");
    }

    private String getViewName(List<String> entities, String viewType) {
        String viewName = buildProperViewName(entities);
        return viewName.length() > POSTGRES_MAX_VIEW_NAME_LENGTH ? getTrimmedViewName(entities, viewType) : viewName;
    }

    private String getTrimmedViewName(List<String> entities, String viewType) {
        List<Integer> trimmingList = viewTypeTrimmingMap.get(viewType);
        List<String> trimmedNameList = IntStream
                .range(0, entities.size())
                .mapToObj(i -> getTrimmedName(entities, new StringBuilder(), trimmingList, i))
                .map(StringBuilder::toString)
                .collect(Collectors.toList());
        return buildProperViewName(trimmedNameList);
    }

    private StringBuilder getTrimmedName(List<String> entities, StringBuilder sb, List<Integer> trimmingList, int i) {
        int lengthToConsider = trimmingList.get(i);
        String entityName = entities.get(i);
        if (lengthToConsider == 0) {
            sb.append(entityName);
        } else {
            String trimmedName = entityName.substring(0, Math.min(entityName.length(), lengthToConsider));
            sb.append(trimmedName);
        }
        appendCancelOrExit(sb, entityName);
        return sb;
    }

    private void appendCancelOrExit(StringBuilder sb, String entityName) {
        if (entityName.contains("EXIT")) {
            sb.append(" EXIT");
        } else if (entityName.contains("CANCEL")) {
            sb.append(" CANCEL");
        }
    }

    private String getViewNamePrefix(Organisation organisation) {
        return organisation.getUsernameSuffix() == null ? organisation.getName() : organisation.getUsernameSuffix();
    }

    public static String getExitName(String operationalProgramName) {
        return operationalProgramName.concat(" EXIT");
    }

    public static String getCancelName(String name) {
        return name.concat(" CANCEL");
    }

    public Organisation getOrganisation() {
        return organisation;
    }
}
