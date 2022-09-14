package org.avni.exporter.v2;

import org.avni.application.FormElement;
import org.avni.application.FormElementType;
import org.avni.domain.*;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.lang.String.format;

@Component
public class HeaderCreator {

    //        row.add(auditable.getCreatedBy().getUsername());
//        row.add(getDateForTimeZone(auditable.getCreatedDateTime()));
//        row.add(auditable.getLastModifiedBy().getUsername());
//        row.add(getDateForTimeZone(auditable.getLastModifiedDateTime()));
//    }

    private static Map<String, HeaderNameAndFunctionMapper<Individual>> registrationDataMap = new LinkedHashMap<String, HeaderNameAndFunctionMapper<Individual>>() {{
        put("id", new HeaderNameAndFunctionMapper<>("id", CHSBaseEntity::getId));
        put("uuid", new HeaderNameAndFunctionMapper<>("uuid", CHSBaseEntity::getUuid));
        put("firstName", new HeaderNameAndFunctionMapper<>("first_name", Individual::getFirstName));
        put("middleName", new HeaderNameAndFunctionMapper<>("middle_name", (Individual individual) -> {
            if (individual.getSubjectType().isAllowMiddleName()) {
                return individual.getMiddleName();
            } else {
                return "";
            }
        }));
        put("lastName", new HeaderNameAndFunctionMapper<>("last_name", Individual::getLastName));
        put("dateOfBirth", new HeaderNameAndFunctionMapper<>("date_of_birth", Individual::getDateOfBirth));
        put("registrationDate", new HeaderNameAndFunctionMapper<>("registration_date", Individual::getRegistrationDate));
        put("gender", new HeaderNameAndFunctionMapper<>("gender", Individual::getGender));
        put("createdBy", new HeaderNameAndFunctionMapper<>("created_by", (Individual individual) -> individual.getCreatedBy().getName()));
        put("createdDateTime", new HeaderNameAndFunctionMapper<>("created_date_time", Individual::getCreatedDateTime));
        put("lastModifiedBy", new HeaderNameAndFunctionMapper<>("last_modified_by", (Individual individual) -> individual.getLastModifiedBy().getName()));
        put("lastModifiedDateTime", new HeaderNameAndFunctionMapper<>("last_modified_date_time", Individual::getLastModifiedDateTime));
        put("voided", new HeaderNameAndFunctionMapper<>("voided", CHSEntity::isVoided));
    }};

    private static Map<String, HeaderNameAndFunctionMapper<ProgramEnrolment>> enrolmentDataMap = new LinkedHashMap<String, HeaderNameAndFunctionMapper<ProgramEnrolment>>() {{
        put("id", new HeaderNameAndFunctionMapper<>("id", CHSBaseEntity::getId));
        put("uuid", new HeaderNameAndFunctionMapper<>("uuid", CHSBaseEntity::getUuid));
        put("enrolmentDateTime", new HeaderNameAndFunctionMapper<>("enrolment_date_time", ProgramEnrolment::getEnrolmentDateTime));
        put("programExitDateTime", new HeaderNameAndFunctionMapper<>("program_exit_date_time", ProgramEnrolment::getProgramExitDateTime));
        put("createdBy", new HeaderNameAndFunctionMapper<>("created_by", (ProgramEnrolment individual) -> individual.getCreatedBy().getName()));
        put("createdDateTime", new HeaderNameAndFunctionMapper<>("created_date_time", ProgramEnrolment::getCreatedDateTime));
        put("lastModifiedBy", new HeaderNameAndFunctionMapper<>("last_modified_by", (ProgramEnrolment individual) -> individual.getLastModifiedBy().getName()));
        put("lastModifiedDateTime", new HeaderNameAndFunctionMapper<>("last_modified_date_time", ProgramEnrolment::getLastModifiedDateTime));
        put("voided", new HeaderNameAndFunctionMapper<>("voided", CHSEntity::isVoided));
    }};

    private static Map<String, HeaderNameAndFunctionMapper<AbstractEncounter>> encounterDataMap = new LinkedHashMap<String, HeaderNameAndFunctionMapper<AbstractEncounter>>() {{
        put("id", new HeaderNameAndFunctionMapper<>("id", CHSBaseEntity::getId));
        put("uuid", new HeaderNameAndFunctionMapper<>("uuid", CHSBaseEntity::getUuid));
        put("name", new HeaderNameAndFunctionMapper<>("name", AbstractEncounter::getName));
        put("earliestVisitDateTime", new HeaderNameAndFunctionMapper<>("earliest_visit_date_time", AbstractEncounter::getEarliestVisitDateTime));
        put("maxVisitDateTime", new HeaderNameAndFunctionMapper<>("max_visit_date_time", AbstractEncounter::getMaxVisitDateTime));
        put("encounterDateTime", new HeaderNameAndFunctionMapper<>("encounter_date_time", AbstractEncounter::getEncounterDateTime));
        put("cancelDateTime", new HeaderNameAndFunctionMapper<>("cancel_date_time", AbstractEncounter::getCancelDateTime));
        put("createdBy", new HeaderNameAndFunctionMapper<>("created_by", (AbstractEncounter individual) -> individual.getCreatedBy().getName()));
        put("createdDateTime", new HeaderNameAndFunctionMapper<>("created_date_time", AbstractEncounter::getCreatedDateTime));
        put("lastModifiedBy", new HeaderNameAndFunctionMapper<>("last_modified_by", (AbstractEncounter individual) -> individual.getLastModifiedBy().getName()));
        put("lastModifiedDateTime", new HeaderNameAndFunctionMapper<>("last_modified_date_time", AbstractEncounter::getLastModifiedDateTime));
        put("voided", new HeaderNameAndFunctionMapper<>("voided", CHSEntity::isVoided));
    }};


    public StringBuilder addRegistrationHeaders(SubjectType subjectType,
                                                Map<String, FormElement> registrationMap,
                                                List<String> addressLevelTypes,
                                                List<String> fields) {
        StringBuilder registrationHeaders = new StringBuilder();
        String subjectTypeName = subjectType.getName();
        registrationHeaders.append(getStaticRegistrationHeaders(fields, subjectTypeName));
        addAddressLevelHeaderNames(registrationHeaders, addressLevelTypes);
        if (subjectType.isGroup()) {
            registrationHeaders.append(",").append(subjectTypeName).append(".total_members");
        }
        appendObsHeaders(registrationHeaders, subjectTypeName, registrationMap, fields);
        return registrationHeaders;
    }

    public StringBuilder addEnrolmentHeaders(Map<String, FormElement> enrolmentMap,
                                             Map<String, FormElement> exitEnrolmentMap,
                                             String programName,
                                             List<String> fields) {
        StringBuilder enrolmentHeaders = new StringBuilder();
        enrolmentHeaders.append(getStaticEnrolmentHeaders(fields, programName));
        appendObsHeaders(enrolmentHeaders, programName, enrolmentMap, fields);
        appendObsHeaders(enrolmentHeaders, programName + "_exit", exitEnrolmentMap, fields);
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
            if (visit != 1) {
                encounterHeaders.append(",");
            }
            String prefix = encounterTypeName + "_" + visit;
            encounterHeaders.append(appendStaticEncounterHeaders(fields, prefix));
            appendObsHeaders(encounterHeaders, prefix, encounterMap, fields);
            appendObsHeaders(encounterHeaders, prefix, encounterCancelMap, fields);
        }
        return encounterHeaders;
    }

    private String getStaticRegistrationHeaders(List<String> fields, String prefix) {
        initMapIfFieldsNotSet(fields, registrationDataMap);
        return fields.stream()
                .filter(registrationDataMap::containsKey)
                .map(key -> String.format("%s_%s", prefix, registrationDataMap.get(key).getName()))
                .collect(Collectors.joining(","));
    }

    private String getStaticEnrolmentHeaders(List<String> fields, String prefix) {
        initMapIfFieldsNotSet(fields, enrolmentDataMap);
        return fields.stream()
                .filter(enrolmentDataMap::containsKey)
                .map(key -> String.format("%s_%s", prefix, enrolmentDataMap.get(key).getName()))
                .collect(Collectors.joining(","));
    }

    private String appendStaticEncounterHeaders(List<String> fields, String prefix) {
        initMapIfFieldsNotSet(fields, encounterDataMap);
        return fields.stream()
                .filter(encounterDataMap::containsKey)
                .map(key -> String.format("%s_%s", prefix, encounterDataMap.get(key).getName()))
                .collect(Collectors.joining(","));
    }

    private void initMapIfFieldsNotSet(List<String> fields, Map<String, ?> map) {
        if (fields != null && fields.isEmpty() && map != null && !map.isEmpty()) {
            fields.addAll(map.keySet());
        }
    }

    private void addAddressLevelHeaderNames(StringBuilder sb, List<String> addressLevelTypes) {
        addressLevelTypes.forEach(level -> sb.append(",").append(quotedStringValue(level)));
    }

    protected String quotedStringValue(String text) {
        if (StringUtils.isEmpty(text))
            return text;
        return "\"".concat(text).concat("\"");
    }

    private void appendObsHeaders(StringBuilder sb, String prefix, Map<String, FormElement> map, List<String> fields) {
        fields.addAll(map.keySet());
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

    public static Map<String, HeaderNameAndFunctionMapper<Individual>> getRegistrationDataMap() {
        return registrationDataMap;
    }

    public static Map<String, HeaderNameAndFunctionMapper<ProgramEnrolment>> getEnrolmentDataMap() {
        return enrolmentDataMap;
    }

    public static Map<String, HeaderNameAndFunctionMapper<AbstractEncounter>> getEncounterDataMap() {
        return encounterDataMap;
    }
}
