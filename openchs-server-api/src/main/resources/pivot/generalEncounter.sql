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
  oet.name "Enc.Type",
  encounter.id "Enc.Id",
  encounter.earliest_visit_date_time "Enc.earliest_visit_date_time",
  encounter.encounter_date_time "Enc.encounter_date_time",
  encounter.uuid "Enc.uuid",
  encounter.name "Enc.name",
  encounter.max_visit_date_time "Enc.max_visit_date_time",
  encounter.is_voided "Enc.is_voided",
  ${individual},
  ${encounter},
  encounter.cancel_date_time "EncCancel.cancel_date_time",
  ${encounterCancellation}
FROM encounter encounter
  LEFT OUTER JOIN operational_encounter_type oet on encounter.encounter_type_id = oet.encounter_type_id
  LEFT OUTER JOIN individual individual ON encounter.individual_id = individual.id
  LEFT OUTER JOIN gender g ON g.id = individual.gender_id
  LEFT OUTER JOIN address_level a ON individual.address_id = a.id
WHERE oet.uuid = '${encounterTypeUuid}'
  AND encounter.encounter_date_time IS NOT NULL;
