--[Data Extract Report]
SELECT
  individual.id "Ind.Id",
  individual.address_id "Ind.address_id",
  individual.uuid "Ind.uuid",
  individual.first_name "Ind.first_name",
  individual.last_name "Ind.last_name",
  g.name "Ind.Gender",
  individual.date_of_birth "Ind.date_of_birth",
  individual.date_of_birth_verified "Ind.date_of_birth_verified",
  individual.registration_date "Ind.registration_date",
  individual.facility_id  "Ind.facility_id",
  a.title "Ind.Area",
  individual.is_voided "Ind.is_voided",
  op.name "Enl.Program Name",
  programEnrolment.id  "Enl.Id",
  programEnrolment.uuid  "Enl.uuid",
  programEnrolment.is_voided "Enl.is_voided",
  oet.name "Enc.Type",
  programEncounter.id "Enc.Id",
  programEncounter.earliest_visit_date_time "Enc.earliest_visit_date_time",
  programEncounter.encounter_date_time "Enc.encounter_date_time",
  programEncounter.program_enrolment_id "Enc.program_enrolment_id",
  programEncounter.uuid "Enc.uuid",
  programEncounter.name "Enc.name",
  programEncounter.max_visit_date_time "Enc.max_visit_date_time",
  programEncounter.is_voided "Enc.is_voided",
  ${individual},
  ${programEnrolment},
  ${programEncounter},
  programEncounter.cancel_date_time "EncCancel.cancel_date_time",
  ${programEncounterCancellation}
FROM program_encounter programEncounter
  LEFT OUTER JOIN operational_encounter_type oet on programEncounter.encounter_type_id = oet.encounter_type_id
  LEFT OUTER JOIN program_enrolment programEnrolment ON programEncounter.program_enrolment_id = programEnrolment.id
  LEFT OUTER JOIN operational_program op ON op.program_id = programEnrolment.program_id
  LEFT OUTER JOIN individual individual ON programEnrolment.individual_id = individual.id
  LEFT OUTER JOIN gender g ON g.id = individual.gender_id
  LEFT OUTER JOIN address_level a ON individual.address_id = a.id
WHERE op.uuid = '${operationalProgramUuid}'
  AND oet.uuid = '${operationalEncounterTypeUuid}'
  AND programEncounter.encounter_date_time IS NOT NULL
  AND programEnrolment.enrolment_date_time IS NOT NULL;