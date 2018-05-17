SELECT
  individual.first_name,
  individual.last_name,
  g.name,
  a.title,
  c2.name,
  programEncounter.encounter_date_time,
  et.name,
  ${individual},
  ${programEnrolment},
  ${programEncounter}
FROM program_encounter programEncounter
  LEFT OUTER JOIN encounter_type et on programEncounter.encounter_type_id = et.id
  LEFT OUTER JOIN program_enrolment programEnrolment ON programEncounter.program_enrolment_id = programEnrolment.id
  LEFT OUTER JOIN program p ON p.id = programEnrolment.program_id
  LEFT OUTER JOIN individual individual ON programEnrolment.individual_id = individual.id
  LEFT OUTER JOIN gender g ON g.id = individual.gender_id
  LEFT OUTER JOIN address_level a ON individual.address_id = a.id
  LEFT OUTER JOIN catchment_address_mapping m2 ON a.id = m2.addresslevel_id
  LEFT OUTER JOIN catchment c2 ON m2.catchment_id = c2.id
WHERE p.name = '${programName}' AND programEncounter.encounter_date_time IS NOT NULL AND
      programEnrolment.enrolment_date_time IS NOT NULL;