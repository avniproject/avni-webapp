--[SQL template for auto generated view]
${concept_maps}
SELECT individual.id                                                                          "individual_id",
       op.name                                                                                "program_name",
       op.program_id                                                                          "program_id",
       programEnrolment.id                                                                    "id",
       programEnrolment.uuid                                                                  "uuid",
       programEnrolment.enrolment_date_time                                                   "enrolment_date_time",
       programEnrolment.enrolment_location                                                    "enrolment_location",
       programEnrolment.is_voided                                                             "is_voided",
       programEnrolment.audit_id                                                              "audit_id",
       programEnrolment.program_exit_date_time                                                "program_exit_date_time",
       programEnrolment.exit_location                                                         "exit_location",
       ${programEnrolment}
FROM public.program_enrolment programEnrolment
  ${cross_join_concept_maps}
         LEFT OUTER JOIN public.operational_program op ON op.program_id = programEnrolment.program_id
         LEFT OUTER JOIN public.individual individual ON programEnrolment.individual_id = individual.id
         LEFT OUTER JOIN public.operational_subject_type ost ON ost.subject_type_id = individual.subject_type_id
WHERE op.uuid = '${operationalProgramUuid}'
  AND ost.uuid = '${operationalSubjectTypeUuid}';
