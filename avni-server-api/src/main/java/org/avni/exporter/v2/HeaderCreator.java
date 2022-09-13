package org.avni.exporter.v2;

import org.avni.application.FormElement;
import org.avni.application.FormElementType;
import org.avni.domain.*;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.lang.String.format;

@Component
public class HeaderCreator {

    private static Map<String, HeaderNameAndFunctionMapper<Individual>> registrationDataMap = new HashMap<String, HeaderNameAndFunctionMapper<Individual>>() {{
        put("id", new HeaderNameAndFunctionMapper<>("id", CHSBaseEntity::getId));
        put("uuid", new HeaderNameAndFunctionMapper<>("uuid", CHSBaseEntity::getUuid));
        put("firstName", new HeaderNameAndFunctionMapper<>("first_name", Individual::getFirstName));
        put("middleName", new HeaderNameAndFunctionMapper<>("middle_name", Individual::getMiddleName));
        put("lastName", new HeaderNameAndFunctionMapper<>("last_name", Individual::getLastName));
        put("dateOfBirth", new HeaderNameAndFunctionMapper<>("date_of_birth", Individual::getDateOfBirth));
        put("registrationDate", new HeaderNameAndFunctionMapper<>("registration_date", Individual::getRegistrationDate));
        put("gender", new HeaderNameAndFunctionMapper<>("gender", Individual::getGender));
    }};

    private static Map<String, HeaderNameAndFunctionMapper<ProgramEnrolment>> enrolmentDataMap = new HashMap<String, HeaderNameAndFunctionMapper<ProgramEnrolment>>() {{
        put("id", new HeaderNameAndFunctionMapper<>("id", CHSBaseEntity::getId));
        put("uuid", new HeaderNameAndFunctionMapper<>("uuid", CHSBaseEntity::getUuid));
        put("enrolmentDateTime", new HeaderNameAndFunctionMapper<>("enrolment_date_time", ProgramEnrolment::getEnrolmentDateTime));
        put("programExitDateTime", new HeaderNameAndFunctionMapper<>("program_exit_date_time", ProgramEnrolment::getProgramExitDateTime));
    }};

    private static Map<String, HeaderNameAndFunctionMapper<AbstractEncounter>> encounterDataMap = new HashMap<String, HeaderNameAndFunctionMapper<AbstractEncounter>>() {{
        put("id", new HeaderNameAndFunctionMapper<>("id", CHSBaseEntity::getId));
        put("uuid", new HeaderNameAndFunctionMapper<>("uuid", CHSBaseEntity::getUuid));
        put("name", new HeaderNameAndFunctionMapper<>("name", AbstractEncounter::getName));
        put("earliestVisitDateTime", new HeaderNameAndFunctionMapper<>("earliest_visit_date_time", AbstractEncounter::getEarliestVisitDateTime));
        put("maxVisitDateTime", new HeaderNameAndFunctionMapper<>("max_visit_date_time", AbstractEncounter::getMaxVisitDateTime));
        put("encounterDateTime", new HeaderNameAndFunctionMapper<>("encounter_date_time", AbstractEncounter::getEncounterDateTime));
        put("cancelDateTime", new HeaderNameAndFunctionMapper<>("cancel_date_time", AbstractEncounter::getCancelDateTime));
    }};


    public StringBuilder addRegistrationHeaders(SubjectType subjectType,
                                                Map<String, FormElement> registrationMap,
                                                List<String> addressLevelTypes,
                                                List<String> fields) {
        StringBuilder registrationHeaders = new StringBuilder();
        String subjectTypeName = subjectType.getName();
        appendStaticRegistrationHeaders(registrationHeaders, fields, subjectTypeName);
        addAddressLevelHeaderNames(registrationHeaders, addressLevelTypes);
        if (subjectType.isGroup()) {
            registrationHeaders.append(",").append(subjectTypeName).append(".total_members");
        }
        appendObsHeaders(registrationHeaders, subjectTypeName, registrationMap);
        addAuditHeaders(registrationHeaders, subjectTypeName);
        return registrationHeaders;
    }

    public StringBuilder addEnrolmentHeaders(Map<String, FormElement> enrolmentMap,
                                             Map<String, FormElement> exitEnrolmentMap,
                                             String programName,
                                             List<String> fields) {
        StringBuilder enrolmentHeaders = new StringBuilder();
        appendStaticEnrolmentHeaders(enrolmentHeaders, fields, programName);
        appendObsHeaders(enrolmentHeaders, programName, enrolmentMap);
        appendObsHeaders(enrolmentHeaders, programName + "_exit", exitEnrolmentMap);
        addAuditHeaders(enrolmentHeaders, programName);
        return enrolmentHeaders;
    }

    public StringBuilder addEncounterHeaders(Long maxVisitCount,
                                             Map<String, FormElement> encounterMap,
                                             Map<String, FormElement> encounterCancelMap,
                                             String encounterTypeName,
                                             List<String> fields) {
        StringBuilder encounterHeaders = new StringBuilder();
        int visit = 0;
        while (visit < maxVisitCount) {
            visit++;
            String prefix = encounterTypeName + "_" + visit;
            appendStaticEncounterHeaders(encounterHeaders, fields, prefix);
            appendObsHeaders(encounterHeaders, prefix, encounterMap);
            appendObsHeaders(encounterHeaders, prefix, encounterCancelMap);
            addAuditHeaders(encounterHeaders, prefix);
        }
        return encounterHeaders;
    }

    private void appendStaticRegistrationHeaders(StringBuilder registrationHeaders, List<String> fields, String prefix) {
        fields.stream()
                .filter(registrationDataMap::containsKey)
                .forEach(key -> registrationHeaders.append(",").append(prefix).append(".").append(registrationDataMap.get(key).getName()));
    }

    private void appendStaticEnrolmentHeaders(StringBuilder enrolmentHeaders, List<String> fields, String prefix) {
        fields.stream()
                .filter(enrolmentDataMap::containsKey)
                .forEach(key -> enrolmentHeaders.append(",").append(prefix).append(".").append(enrolmentDataMap.get(key).getName()));
    }

    private void appendStaticEncounterHeaders(StringBuilder encounterHeaders, List<String> fields, String prefix) {
        fields.stream()
                .filter(encounterDataMap::containsKey)
                .forEach(key -> encounterHeaders.append(",").append(prefix).append(".").append(encounterDataMap.get(key).getName()));
    }

    private void addAddressLevelHeaderNames(StringBuilder sb, List<String> addressLevelTypes) {
        addressLevelTypes.forEach(level -> sb.append(",").append(quotedStringValue(level)));
    }

    private String quotedStringValue(String text) {
        if (StringUtils.isEmpty(text))
            return text;
        return "\"".concat(text).concat("\"");
    }

    private void appendObsHeaders(StringBuilder sb, String prefix, Map<String, FormElement> map) {
        map.forEach((uuid, fe) -> {
            if (ConceptDataType.isGroupQuestion(fe.getConcept().getDataType())) return;
            Concept concept = fe.getConcept();
            String groupPrefix = fe.getGroup() != null ? fe.getGroup().getConcept().getName() + "_" : "";
            if (concept.getDataType().equals(ConceptDataType.Coded.toString()) && fe.getType().equals(FormElementType.MultiSelect.toString())) {
                concept.getSortedAnswers().map(ca -> ca.getAnswerConcept().getName()).forEach(can ->
                        sb.append(",\"")
                                .append(prefix)
                                .append("_")
                                .append(groupPrefix)
                                .append(concept.getName())
                                .append("_").append(can).append("\""));
            } else {
                sb.append(",\"").append(prefix).append("_").append(groupPrefix).append(concept.getName()).append("\"");
            }
        });
    }

    private void addAuditHeaders(StringBuilder headers, String prefix) {
        headers.append(",").append(format("%s_created_by", prefix));
        headers.append(",").append(format("%s_created_date_time", prefix));
        headers.append(",").append(format("%s_modified_by", prefix));
        headers.append(",").append(format("%s_modified_date_time", prefix));
    }

}
