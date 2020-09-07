--[Data Extract Report]
SELECT individual.id                                                                          "individual_id",
       op.name                                                                                "program_name",
       op.program_id                                                                          "program_id",
       programEnrolment.id                                                                    "id",
       programEnrolment.uuid                                                                  "uuid",
       programEnrolment.enrolment_date_time                                                   "enrolment_date_time",
       programEnrolment.enrolment_location                                                    "enrolment_location",
       programEnrolment.is_voided                                                             "is_voided",
       programEnrolment.program_exit_date_time                                                "program_exit_date_time",
       programEnrolment.exit_location                                                         "exit_location",
       programEnrolment.audit_id                                                              "audit_id",
       ${programEnrolmentExit}
FROM program_enrolment programEnrolment
         LEFT OUTER JOIN operational_program op ON op.program_id = programEnrolment.program_id
         LEFT OUTER JOIN individual individual ON programEnrolment.individual_id = individual.id
         LEFT OUTER JOIN operational_subject_type ost ON ost.subject_type_id = individual.subject_type_id
WHERE op.uuid = '${operationalProgramUuid}'
  AND ost.uuid = '${operationalSubjectTypeUuid}'
  AND programEnrolment.program_exit_date_time notnull;
