--[Data Extract Report]
SELECT individual.id                                                                          "individual_id",
       oet.name                                                                               "encounter_type_name",
       oet.encounter_type_id                                                                  "encounter_type_id",
       encounter.id                                                                           "id",
       encounter.earliest_visit_date_time                                                     "earliest_visit_date_time",
       encounter.encounter_date_time                                                          "encounter_date_time",
       encounter.uuid                                                                         "uuid",
       encounter.name                                                                         "name",
       encounter.max_visit_date_time                                                          "max_visit_date_time",
       encounter.is_voided                                                                    "is_voided",
       encounter.encounter_location                                                           "encounter_location",
       encounter.audit_id                                                                     "audit_id",
       encounter.cancel_date_time                                                             "cancel_date_time",
       encounter.cancel_location                                                              "cancel_location",
       ${encounter}
FROM encounter encounter
         LEFT OUTER JOIN operational_encounter_type oet on encounter.encounter_type_id = oet.encounter_type_id
         LEFT OUTER JOIN individual individual ON encounter.individual_id = individual.id
         LEFT OUTER JOIN operational_subject_type ost ON ost.subject_type_id = individual.subject_type_id
WHERE oet.uuid = '${encounterTypeUuid}'
  AND ost.uuid = '${operationalSubjectTypeUuid}';
