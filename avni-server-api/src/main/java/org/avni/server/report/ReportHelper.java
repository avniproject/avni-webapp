package org.avni.server.report;

import org.avni.server.application.FormMapping;
import org.avni.server.domain.EncounterType;
import org.avni.server.domain.Program;
import org.avni.server.domain.SubjectType;
import org.avni.server.util.S;
import org.springframework.stereotype.Component;

import javax.persistence.EntityNotFoundException;
import java.util.List;

import static java.lang.String.format;

@Component
public class ReportHelper {


    public String buildQuery(FormMapping formMapping, String baseQuery, String startDate, String endDate, List<Long> lowestLocationIds) {
        SubjectType subjectType = formMapping.getSubjectType();
        EncounterType encounterType = formMapping.getEncounterType();
        Program program = formMapping.getProgram();
        switch (formMapping.getForm().getFormType()) {
            case IndividualProfile: {
                String dynamicWhere = String.format("subject_type_id = %d and i.is_voided = false", subjectType.getId());
                if (startDate != null) {
                    dynamicWhere = dynamicWhere.concat(format(" and registration_date::date between '%s'::date and '%s'::date", startDate, endDate));
                }
                return replaceInQuery(baseQuery, "observations", "individual i", dynamicWhere, lowestLocationIds);
            }
            case Encounter: {
                String obsColumn = "enc.observations";
                String dynamicFrom = "encounter enc join individual i on i.id = enc.individual_id";
                String dynamicWhere = String.format("i.subject_type_id = %d and enc.encounter_type_id = %d " +
                                "and i.is_voided = false and enc.is_voided = false",
                        subjectType.getId(), encounterType.getId());
                if (startDate != null) {
                    dynamicWhere = dynamicWhere.concat(format(" and encounter_date_time::date between '%s'::date and '%s'::date", startDate, endDate));
                }
                return replaceInQuery(baseQuery, obsColumn, dynamicFrom, dynamicWhere, lowestLocationIds);
            }
            case ProgramEnrolment: {
                String obsColumn = "enl.observations";
                String dynamicFrom = "program_enrolment enl join individual i on i.id = enl.individual_id";
                String dynamicWhere = String.format("i.subject_type_id = %d and enl.program_id = %d " +
                                "and i.is_voided = false and enl.is_voided = false",
                        subjectType.getId(), program.getId());
                if (startDate != null) {
                    dynamicWhere = dynamicWhere.concat(format(" and enrolment_date_time::date between '%s'::date and '%s'::date", startDate, endDate));
                }
                return replaceInQuery(baseQuery, obsColumn, dynamicFrom, dynamicWhere, lowestLocationIds);
            }
            case ProgramEncounter: {
                String obsColumn = "enc.observations";
                String dynamicFrom = "program_encounter enc join program_enrolment enl on enc.program_enrolment_id = enl.id \n" +
                        "               join individual i on i.id = enl.individual_id";
                String dynamicWhere = String.format("i.subject_type_id = %d and enl.program_id = %d and enc.encounter_type_id = %d " +
                                "and i.is_voided = false and enl.is_voided = false and enc.is_voided = false",
                        subjectType.getId(), program.getId(), encounterType.getId());
                if (startDate != null) {
                    dynamicWhere = dynamicWhere.concat(format(" and encounter_date_time::date between '%s'::date and '%s'::date", startDate, endDate));
                }
                return replaceInQuery(baseQuery, obsColumn, dynamicFrom, dynamicWhere, lowestLocationIds);
            }
//            case IndividualEncounterCancellation: {
//
//            }
//            case ProgramExit: {
//
//            }
//            case ProgramEncounterCancellation: {
//
//            }
            default: {
                throw new EntityNotFoundException(String.format("Form %s not mapped correctly", formMapping.getFormName()));
            }
        }
    }

    private String replaceInQuery(String query, String obsColumn, String dynamicFrom, String dynamicWhere, List<Long> lowestLocationIds) {
        if (!lowestLocationIds.isEmpty()) {
            dynamicWhere = dynamicWhere.concat(format(" and a.id in (%s)", S.joinLongToList(lowestLocationIds)));
            dynamicFrom = dynamicFrom.concat(" join address_level a on a.id = i.address_id");
        }
        return query.replace("${obsColumn}", obsColumn)
                .replace("${dynamicFrom}", dynamicFrom)
                .replace("${dynamicWhere}", dynamicWhere);
    }
}
