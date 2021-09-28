--[SQL template for auto generated view]
${concept_maps}
SELECT programEnrolment.id                                                                    "program_enrolment_id",
       oet.name                                                                               "encounter_type_name",
       oet.encounter_type_id                                                                  "encounter_type_id",
       programEncounter.id                                                                    "id",
       programEncounter.earliest_visit_date_time                                              "earliest_visit_date_time",
       programEncounter.encounter_date_time                                                   "encounter_date_time",
       programEncounter.uuid                                                                  "uuid",
       programEncounter.name                                                                  "name",
       programEncounter.max_visit_date_time                                                   "max_visit_date_time",
       programEncounter.is_voided                                                             "is_voided",
       programEncounter.encounter_location                                                    "encounter_location",
       programEncounter.audit_id                                                              "audit_id",
       programEncounter.cancel_date_time                                                      "cancel_date_time",
       programEncounter.cancel_location                                                       "cancel_location",
       ${programEncounter}
FROM public.program_encounter programEncounter
      ${cross_join_concept_maps}
         LEFT OUTER JOIN public.operational_encounter_type oet on programEncounter.encounter_type_id = oet.encounter_type_id
         LEFT OUTER JOIN public.program_enrolment programEnrolment
                         ON programEncounter.program_enrolment_id = programEnrolment.id
         LEFT OUTER JOIN public.operational_program op ON op.program_id = programEnrolment.program_id
         LEFT OUTER JOIN public.individual individual ON programEnrolment.individual_id = individual.id
         LEFT OUTER JOIN public.operational_subject_type ost ON ost.subject_type_id = individual.subject_type_id
WHERE op.uuid = '${operationalProgramUuid}'
  AND oet.uuid = '${operationalEncounterTypeUuid}'
  AND ost.uuid = '${operationalSubjectTypeUuid}';