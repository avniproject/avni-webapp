package org.avni.report;

import org.avni.application.FormMapping;
import org.avni.domain.EncounterType;
import org.avni.domain.Program;
import org.avni.domain.SubjectType;
import org.springframework.stereotype.Component;

import javax.persistence.EntityNotFoundException;

@Component
public class ReportHelper {


    public String buildQuery(FormMapping formMapping, String baseQuery) {
        SubjectType subjectType = formMapping.getSubjectType();
        EncounterType encounterType = formMapping.getEncounterType();
        Program program = formMapping.getProgram();
        switch (formMapping.getForm().getFormType()) {
            case IndividualProfile: {
                String dynamicWhere = String.format("subject_type_id = %d and is_voided = false", subjectType.getId());
                return replaceInQuery(baseQuery, "observations", "individual", dynamicWhere);
            }
            case Encounter: {
                String obsColumn = "enc.observations";
                String dynamicFrom = "encounter enc join individual i on i.id = enc.individual_id";
                String dynamicWhere = String.format("i.subject_type_id = %d and enc.encounter_type_id = %d " +
                                "and i.is_voided = false and enc.is_voided = false",
                        subjectType.getId(), encounterType.getId());
                return replaceInQuery(baseQuery, obsColumn, dynamicFrom, dynamicWhere);
            }
            case ProgramEnrolment: {
                String obsColumn = "enl.observations";
                String dynamicFrom = "program_enrolment enl join individual i on i.id = enl.individual_id";
                String dynamicWhere = String.format("i.subject_type_id = %d and enl.program_id = %d " +
                                "and i.is_voided = false and enl.is_voided = false",
                        subjectType.getId(), program.getId());
                return replaceInQuery(baseQuery, obsColumn, dynamicFrom, dynamicWhere);
            }
            case ProgramEncounter: {
                String obsColumn = "enc.observations";
                String dynamicFrom = "program_encounter enc join program_enrolment enl on enc.program_enrolment_id = enl.id \n" +
                        "               join individual i on i.id = enl.individual_id";
                String dynamicWhere = String.format("i.subject_type_id = %d and enl.program_id = %d and enc.encounter_type_id = %d " +
                                "and i.is_voided = false and enl.is_voided = false and enc.is_voided = false",
                        subjectType.getId(), program.getId(), encounterType.getId());
                return replaceInQuery(baseQuery, obsColumn, dynamicFrom, dynamicWhere);
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

    private String replaceInQuery(String query, String obsColumn, String dynamicFrom, String dynamicWhere) {
        return query.replace("${obsColumn}", obsColumn)
                .replace("${dynamicFrom}", dynamicFrom)
                .replace("${dynamicWhere}", dynamicWhere);
    }
}
