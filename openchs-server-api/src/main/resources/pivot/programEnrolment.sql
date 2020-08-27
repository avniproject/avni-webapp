--[Data Extract Report]
SELECT individual.id                                                                          "Ind.Id",
       individual.address_id                                                                  "Ind.address_id",
       individual.uuid                                                                        "Ind.uuid",
       individual.first_name                                                                  "Ind.first_name",
       individual.last_name                                                                   "Ind.last_name",
       g.name                                                                                 "Ind.Gender",
       individual.date_of_birth                                                               "Ind.date_of_birth",
       EXTRACT(year from age(date_of_birth))                                               as "Ind.age_in_years",
       EXTRACT(year FROM age(date_of_birth)) * 12 + EXTRACT(month FROM age(date_of_birth)) as "Ind.age_in_months",
       individual.date_of_birth_verified                                                      "Ind.date_of_birth_verified",
       individual.registration_date                                                           "Ind.registration_date",
       individual.facility_id                                                                 "Ind.facility_id",
       individual.registration_location                                                       "Ind.registration_location",
       individual.subject_type_id                                                             "Ind.subject_type_id",
       individual.audit_id                                                                    "Ind.audit_id",
       ost.name                                                                               "Ind.subject_type_name",
       a.title                                                                                "Ind.location_name",
       individual.is_voided                                                                   "Ind.is_voided",
       op.name                                                                                "Enl.program_name",
       op.program_id                                                                          "Enl.program_id",
       programEnrolment.id                                                                    "Enl.Id",
       programEnrolment.uuid                                                                  "Enl.uuid",
       programEnrolment.enrolment_date_time                                                   "Enl.enrolment_date_time",
       programEnrolment.enrolment_location                                                    "Enl.enrolment_location",
       programEnrolment.is_voided                                                             "Enl.is_voided",
       programEnrolment.audit_id                                                              "Enl.audit_id",
       programEnrolment.program_exit_date_time                                                "Enl.program_exit_date_time",
       programEnrolment.exit_location                                                         "Enl.exit_location",
       ${individual},
       ${programEnrolment}
FROM program_enrolment programEnrolment
         LEFT OUTER JOIN operational_program op ON op.program_id = programEnrolment.program_id
         LEFT OUTER JOIN individual individual ON programEnrolment.individual_id = individual.id
         LEFT OUTER JOIN operational_subject_type ost ON ost.subject_type_id = individual.subject_type_id
         LEFT OUTER JOIN gender g ON g.id = individual.gender_id
         LEFT OUTER JOIN address_level a ON individual.address_id = a.id
WHERE op.uuid = '${operationalProgramUuid}'
  AND ost.uuid = '${operationalSubjectTypeUuid}';
