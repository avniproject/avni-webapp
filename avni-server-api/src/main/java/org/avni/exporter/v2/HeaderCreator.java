package org.avni.exporter.v2;

import org.avni.application.FormElement;
import org.avni.application.FormElementType;
import org.avni.domain.Concept;
import org.avni.domain.ConceptDataType;
import org.avni.domain.SubjectType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

import static java.lang.String.format;

@Component
public class HeaderCreator {


    public StringBuilder addRegistrationHeaders(SubjectType subjectType, Map<String, FormElement> registrationMap, List<String> addressLevelTypes) {
        StringBuilder registrationHeaders = new StringBuilder();
        String subjectTypeName = subjectType.getName();
        registrationHeaders.append(subjectTypeName).append(".id");
        registrationHeaders.append(",").append(subjectTypeName).append(".uuid");
        registrationHeaders.append(",").append(subjectTypeName).append(".first_name");
        if (subjectType.isAllowMiddleName())
            registrationHeaders.append(",").append(subjectTypeName).append(".middle_name");
        registrationHeaders.append(",").append(subjectTypeName).append(".last_name");
        registrationHeaders.append(",").append(subjectTypeName).append(".date_of_birth");
        registrationHeaders.append(",").append(subjectTypeName).append(".registration_date");
        registrationHeaders.append(",").append(subjectTypeName).append(".gender");
        addAddressLevelHeaderNames(registrationHeaders, addressLevelTypes);
        if (subjectType.isGroup()) {
            registrationHeaders.append(",").append(subjectTypeName).append(".total_members");
        }
        appendObsHeaders(registrationHeaders, subjectTypeName, registrationMap);
        addAuditHeaders(registrationHeaders, subjectTypeName);
        return registrationHeaders;
    }

    public StringBuilder addEnrolmentHeaders(Map<String, FormElement> enrolmentMap, Map<String, FormElement> exitEnrolmentMap, String programName) {
        StringBuilder enrolmentHeaders = new StringBuilder();
        enrolmentHeaders.append(",").append(programName).append(".id");
        enrolmentHeaders.append(",").append(programName).append(".uuid");
        enrolmentHeaders.append(",").append(programName).append(".enrolment_date_time");
        appendObsHeaders(enrolmentHeaders, programName, enrolmentMap);
        enrolmentHeaders.append(",").append(programName).append(".program_exit_date_time");
        appendObsHeaders(enrolmentHeaders, programName + "_exit", exitEnrolmentMap);
        addAuditHeaders(enrolmentHeaders, programName);
        return enrolmentHeaders;
    }

    public StringBuilder addEncounterHeaders(Long maxVisitCount, Map<String, FormElement> encounterMap, Map<String, FormElement> encounterCancelMap, String encounterTypeName) {
        StringBuilder encounterHeaders = new StringBuilder();
        int visit = 0;
        while (visit < maxVisitCount) {
            visit++;
            String prefix = encounterTypeName + "_" + visit;
            encounterHeaders.append(",").append(prefix).append(".id");
            encounterHeaders.append(",").append(prefix).append(".uuid");
            encounterHeaders.append(",").append(prefix).append(".name");
            encounterHeaders.append(",").append(prefix).append(".earliest_visit_date_time");
            encounterHeaders.append(",").append(prefix).append(".max_visit_date_time");
            encounterHeaders.append(",").append(prefix).append(".encounter_date_time");
            appendObsHeaders(encounterHeaders, prefix, encounterMap);
            encounterHeaders.append(",").append(prefix).append(".cancel_date_time");
            appendObsHeaders(encounterHeaders, prefix, encounterCancelMap);
            addAuditHeaders(encounterHeaders, prefix);
        }
        return encounterHeaders;
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
